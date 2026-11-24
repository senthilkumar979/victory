import { execFile } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import {
  EMBER_BUILDS_URL,
  EMBER_DEV_URL,
  EMBER_DEPLOYS_URL,
  EMBER_REPO,
  loadEmberNotifyWorkflow,
  type NotifyRun,
  type NotifyUrls,
  type SlackPayload,
} from './emberNotifyWorkflow'

const CURL_SH = `#!/usr/bin/env bash
set -euo pipefail
data=""
url=""
prev=""
for arg in "$@"; do
  if [ "$prev" = "--data" ]; then data="$arg"; fi
  case "$arg" in
    http://*|https://*) url="$arg" ;;
  esac
  prev="$arg"
done
printf '%s' "$data" > "$CURL_CAPTURE"
printf '%s' "$url" > "$CURL_URL_CAPTURE"
printf '%s\\n%s' "\${FAKE_CURL_BODY:-ok}" "\${FAKE_CURL_CODE:-200}"
`

function isPayload(value: unknown): value is SlackPayload {
  if (!value || typeof value !== 'object') return false
  const record = value as { text?: unknown; attachments?: unknown }
  return typeof record.text === 'string' && Array.isArray(record.attachments)
}

async function readCapture(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') return null
    throw error
  }
}

function exitStatus(error: Error | null): number {
  if (!error) return 0
  const code = (error as { code?: unknown }).code
  return typeof code === 'number' ? code : 1
}

export async function runEmberNotify(
  eventName: string,
  event: unknown,
  urls: NotifyUrls = {
    dev: EMBER_DEV_URL,
    builds: EMBER_BUILDS_URL,
    deploys: EMBER_DEPLOYS_URL,
  },
  curl: { code?: string; body?: string } = {},
): Promise<NotifyRun> {
  const { script } = await loadEmberNotifyWorkflow()
  const root = await mkdtemp(path.join(tmpdir(), 'ember-notify-'))
  const bin = path.join(root, 'bin')
  const payloadPath = path.join(root, 'payload.json')
  const urlPath = path.join(root, 'url.txt')
  await mkdir(bin)
  await writeFile(path.join(root, 'notify.sh'), script)
  await writeFile(path.join(root, 'event.json'), JSON.stringify(event))
  const curlPath = path.join(bin, 'curl')
  await writeFile(curlPath, CURL_SH)
  await chmod(curlPath, 0o755)

  try {
    const executed = await new Promise<{
      status: number
      stdout: string
      stderr: string
    }>((resolve) => {
      execFile(
        'bash',
        [path.join(root, 'notify.sh')],
        {
          encoding: 'utf8',
          timeout: 15000,
          env: {
            PATH: `${bin}:/usr/bin:/bin`,
            HOME: root,
            GITHUB_EVENT_PATH: path.join(root, 'event.json'),
            GITHUB_EVENT_NAME: eventName,
            GITHUB_REPOSITORY: EMBER_REPO,
            DEV_URL: urls.dev ?? '',
            BUILDS_URL: urls.builds ?? '',
            DEPLOYS_URL: urls.deploys ?? '',
            FALLBACK_URL: '',
            CURL_CAPTURE: payloadPath,
            CURL_URL_CAPTURE: urlPath,
            FAKE_CURL_CODE: curl.code ?? '200',
            FAKE_CURL_BODY: curl.body ?? 'ok',
          },
        },
        (error, stdout, stderr) => {
          resolve({
            status: exitStatus(error),
            stdout: String(stdout ?? ''),
            stderr: String(stderr ?? ''),
          })
        },
      )
    })

    const output = `${executed.stdout}\n${executed.stderr}`
    if (output.includes('hooks.example.test')) {
      throw new Error(`webhook URL was written to the log: ${output}`)
    }

    const rawPayload = await readCapture(payloadPath)
    const parsed: unknown = rawPayload ? JSON.parse(rawPayload) : null
    if (parsed !== null && !isPayload(parsed)) {
      throw new Error('Ember payload was not a Slack message')
    }

    return {
      status: executed.status,
      stdout: executed.stdout,
      stderr: executed.stderr,
      payload: parsed,
      postedUrl: await readCapture(urlPath),
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}
