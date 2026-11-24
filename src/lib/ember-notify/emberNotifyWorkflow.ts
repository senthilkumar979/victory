import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const EMBER_REPO = 'senthilkumar979/victory'
export const EMBER_DEV_URL = 'https://hooks.example.test/dev-secret'
export const EMBER_BUILDS_URL = 'https://hooks.example.test/builds-secret'
export const EMBER_DEPLOYS_URL = 'https://hooks.example.test/deploys-secret'

export interface SlackField {
  title: string
  value: string
  short: boolean
}

export interface SlackAttachment {
  color: string
  mrkdwn_in: string[]
  title?: string
  title_link?: string
  text?: string
  fields: SlackField[]
  footer: string
}

export interface SlackPayload {
  text: string
  attachments: SlackAttachment[]
}

export interface NotifyRun {
  status: number
  stdout: string
  stderr: string
  payload: SlackPayload | null
  postedUrl: string | null
}

export interface NotifyUrls {
  dev?: string
  builds?: string
  deploys?: string
}

const workflowPath = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..'),
  '.github/workflows/ember-notify.yml',
)

export function extractNotifyScript(yaml: string): string {
  const marker = 'run: |\n'
  const start = yaml.indexOf(marker)
  if (start < 0) throw new Error('ember notify script not found')

  return yaml
    .slice(start + marker.length)
    .split('\n')
    .map((line) => (line.startsWith('          ') ? line.slice(10) : line))
    .join('\n')
}

export async function loadEmberNotifyWorkflow(): Promise<{
  yaml: string
  script: string
}> {
  const yaml = await readFile(workflowPath, 'utf8')
  return { yaml, script: extractNotifyScript(yaml) }
}

export function notifyAttachment(result: NotifyRun): SlackAttachment {
  const card = result.payload?.attachments[0]
  if (!card) throw new Error('expected a Slack attachment')
  return card
}
