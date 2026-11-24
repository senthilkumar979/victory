import { describe, expect, it } from 'vitest'

import { EMBER_DEV_URL, EMBER_REPO, notifyAttachment } from './emberNotifyWorkflow'
import { runEmberNotify } from './runEmberNotify'

describe('ember notify pull requests', () => {
  it('treats a merged pull request differently from a closed one', async () => {
    const merged = await runEmberNotify('pull_request', {
      action: 'closed',
      pull_request: {
        number: 12,
        title: 'Fix <title>',
        html_url: 'https://github.com/senthilkumar979/victory/pull/12',
        merged: true,
        head: { ref: 'feat/<a>&b' },
        base: { ref: 'main' },
        user: { login: 'octo&cat' },
      },
      sender: { login: 'octo&cat' },
    })
    const closed = await runEmberNotify('pull_request', {
      action: 'closed',
      pull_request: {
        number: 13,
        title: 'Drop',
        html_url: 'https://github.com/senthilkumar979/victory/pull/13',
        merged: false,
        head: { ref: 'wip' },
        base: { ref: 'main' },
        user: { login: 'ada' },
      },
      sender: { login: 'ada' },
    })

    expect(merged.postedUrl).toBe(EMBER_DEV_URL)
    expect(merged.payload?.text).toBe(
      `:tada: PR 12 merged in *${EMBER_REPO}* (octo&amp;cat)`,
    )
    expect(notifyAttachment(merged)).toMatchObject({
      color: '#16a34a',
      title: '#12 Fix &lt;title&gt;',
      fields: [
        { title: 'Branch', value: '`feat/&lt;a&gt;&amp;b` → `main`', short: true },
        { title: 'Author', value: 'octo&amp;cat', short: true },
      ],
    })
    expect(closed.payload?.text).toContain('closed without merging')
    expect(notifyAttachment(closed).color).toBe('#6b7280')
  })

  it('asks the requested team for a review when there is no reviewer login', async () => {
    const result = await runEmberNotify('pull_request', {
      action: 'review_requested',
      requested_team: { name: 'platform' },
      pull_request: {
        number: 4,
        title: 'Review me',
        html_url: 'https://github.com/senthilkumar979/victory/pull/4',
        merged: false,
        head: { ref: 'topic' },
        base: { ref: 'main' },
        user: { login: 'ada' },
      },
      sender: { login: 'ada' },
    })

    expect(result.payload?.text).toBe(
      `:eyes: PR 4 needs a review from platform in *${EMBER_REPO}* (ada)`,
    )
    expect(notifyAttachment(result).color).toBe('#0ea5e9')
  })
})
