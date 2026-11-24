import { describe, expect, it } from 'vitest'

import {
  EMBER_BUILDS_URL,
  EMBER_REPO,
  notifyAttachment,
} from './emberNotifyWorkflow'
import { runEmberNotify } from './runEmberNotify'

describe('ember notify builds', () => {
  it('posts a passing build and a timed-out build to the builds room', async () => {
    const passed = await runEmberNotify('workflow_run', {
      action: 'completed',
      workflow_run: {
        name: 'CI <main>',
        conclusion: 'success',
        head_branch: 'feat/&',
        display_title: 'Ship <it>\nignore',
        html_url: 'https://github.com/senthilkumar979/victory/actions/runs/1',
        head_sha: 'abcdef1234567890',
        run_number: 42,
        triggering_actor: { login: 'pat<bot>' },
        head_commit: { message: 'other' },
      },
      repository: { html_url: 'https://github.com/senthilkumar979/victory' },
    })
    const timedOut = await runEmberNotify('workflow_run', {
      action: 'completed',
      workflow_run: {
        name: 'CI',
        conclusion: 'timed_out',
        head_branch: 'main',
        head_commit: { message: 'Boom <now>\nmore' },
        html_url: 'https://github.com/senthilkumar979/victory/actions/runs/2',
        head_sha: '1234567890abcdef',
        run_number: 9,
        actor: { login: 'builder' },
      },
      repository: { html_url: 'https://github.com/senthilkumar979/victory' },
    })

    expect(passed.postedUrl).toBe(EMBER_BUILDS_URL)
    expect(passed.payload?.text).toBe(
      `:white_check_mark: *CI &lt;main&gt;* passed on \`feat/&amp;\` in *${EMBER_REPO}*`,
    )
    expect(notifyAttachment(passed)).toMatchObject({
      color: '#16a34a',
      title: 'Ship &lt;it&gt;',
      fields: [
        {
          title: 'Commit',
          value:
            '<https://github.com/senthilkumar979/victory/commit/abcdef1234567890|abcdef1>',
          short: true,
        },
        { title: 'Triggered by', value: 'pat&lt;bot&gt;', short: true },
      ],
      footer: `${EMBER_REPO} · run #42`,
    })
    expect(timedOut.payload?.text).toContain(':rotating_light: *CI* failed')
    expect(notifyAttachment(timedOut)).toMatchObject({
      color: '#dc2626',
      title: 'Boom &lt;now&gt;',
      fields: [
        {
          title: 'Commit',
          value:
            '<https://github.com/senthilkumar979/victory/commit/1234567890abcdef|1234567>',
          short: true,
        },
        { title: 'Triggered by', value: 'builder', short: true },
      ],
    })
  })

  it('skips cancelled builds and events it does not handle', async () => {
    const cancelled = await runEmberNotify('workflow_run', {
      action: 'completed',
      workflow_run: {
        name: 'CI',
        conclusion: 'cancelled',
        head_branch: 'main',
        html_url: 'https://github.com/senthilkumar979/victory/actions/runs/3',
        head_sha: '1234567890abcdef',
        run_number: 1,
      },
      repository: { html_url: 'https://github.com/senthilkumar979/victory' },
    })
    const unknown = await runEmberNotify('push', { action: 'opened' })

    expect(cancelled.status).toBe(0)
    expect(cancelled.payload).toBeNull()
    expect(cancelled.stdout).toContain('conclusion cancelled: nothing to post')
    expect(unknown.payload).toBeNull()
    expect(unknown.stdout).toContain("Event push isn't one Ember notify handles")
  })
})
