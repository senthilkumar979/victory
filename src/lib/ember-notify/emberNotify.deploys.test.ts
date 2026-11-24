import { describe, expect, it } from 'vitest'

import {
  EMBER_DEPLOYS_URL,
  EMBER_DEV_URL,
  EMBER_REPO,
  notifyAttachment,
} from './emberNotifyWorkflow'
import { runEmberNotify } from './runEmberNotify'

const openedIssue = {
  action: 'opened',
  issue: {
    number: 7,
    title: 'Hi',
    body: '',
    html_url: 'https://github.com/senthilkumar979/victory/issues/7',
    labels: [],
    assignees: [],
  },
  sender: { login: 'ada' },
}

describe('ember notify deploys', () => {
  it('marks production deploys and falls back to the target url', async () => {
    const production = await runEmberNotify('deployment_status', {
      deployment_status: {
        state: 'success',
        environment_url: 'https://app.example.test/prod',
        target_url: 'https://app.example.test/fallback',
        description: 'Done <ok> & shipped',
        creator: { login: 'ci<bot>' },
      },
      deployment: {
        environment: 'Production - mentorbridge',
        ref: 'release/1.0&2',
        sha: '1234567890abcdef',
        creator: { login: 'other' },
      },
      repository: { html_url: 'https://github.com/senthilkumar979/victory' },
    })
    const preview = await runEmberNotify('deployment_status', {
      deployment_status: {
        state: 'success',
        environment_url: null,
        target_url: 'https://app.example.test/target',
        creator: { login: 'vercel' },
      },
      deployment: {
        environment: 'Preview',
        ref: 'topic',
        sha: 'abcdef1234567890',
        creator: { login: 'other' },
      },
      repository: { html_url: 'https://github.com/senthilkumar979/victory' },
    })

    expect(production.postedUrl).toBe(EMBER_DEPLOYS_URL)
    expect(production.payload?.text).toBe(
      `:rocket: *Production* deploy ready for *${EMBER_REPO}*: <https://app.example.test/prod>`,
    )
    expect(notifyAttachment(production)).toMatchObject({
      color: '#16a34a',
      fields: [
        { title: 'Environment', value: 'Production - mentorbridge', short: true },
        {
          title: 'Ref',
          value:
            '`release/1.0&amp;2` @ <https://github.com/senthilkumar979/victory/commit/1234567890abcdef|1234567>',
          short: true,
        },
        { title: 'Creator', value: 'ci&lt;bot&gt;', short: true },
      ],
      footer: 'Done &lt;ok&gt; &amp; shipped',
    })
    expect(preview.payload?.text).toBe(
      `:eyes: *Preview* deploy ready for *${EMBER_REPO}*: <https://app.example.test/target>`,
    )
    expect(notifyAttachment(preview).footer).toBe('Vercel')
  })

  it('omits an empty deploy link and ignores in-progress deploys', async () => {
    const failed = await runEmberNotify('deployment_status', {
      deployment_status: {
        state: 'error',
        environment_url: '',
        description: null,
        creator: { login: 'vercel' },
      },
      deployment: {
        environment: 'Preview',
        ref: 'topic',
        sha: 'abcdef1234567890',
      },
      repository: { html_url: 'https://github.com/senthilkumar979/victory' },
    })
    const pending = await runEmberNotify('deployment_status', {
      deployment_status: { state: 'pending' },
      deployment: { environment: 'Preview', ref: 'topic', sha: 'abcdef1234567890' },
      repository: { html_url: 'https://github.com/senthilkumar979/victory' },
    })

    expect(failed.payload?.text).toBe(
      `:eyes: *Preview* deploy failed for *${EMBER_REPO}*`,
    )
    expect(notifyAttachment(failed).color).toBe('#dc2626')
    expect(pending.status).toBe(0)
    expect(pending.payload).toBeNull()
    expect(pending.stdout).toContain('deployment_status pending: nothing to post')
  })

  it('skips a missing webhook and records an Ember refusal without failing', async () => {
    const missing = await runEmberNotify('issues', openedIssue, {})
    const refused = await runEmberNotify(
      'issues',
      openedIssue,
      { dev: EMBER_DEV_URL },
      { code: '503', body: 'invalid_payload' },
    )

    expect(missing.status).toBe(0)
    expect(missing.payload).toBeNull()
    expect(missing.stdout).toContain(
      '::warning::No Ember webhook secret set for issues; skipping.',
    )
    expect(refused.status).toBe(0)
    expect(refused.postedUrl).toBe(EMBER_DEV_URL)
    expect(refused.stdout).toContain('Ember answered 503: invalid_payload')
    expect(refused.stdout).toContain(
      '::warning::Ember refused the post (503: invalid_payload)',
    )
  })
})