import { describe, expect, it } from 'vitest'

import {
  EMBER_DEV_URL,
  EMBER_REPO,
  loadEmberNotifyWorkflow,
  notifyAttachment,
} from './emberNotifyWorkflow'
import { runEmberNotify } from './runEmberNotify'

describe('ember notify issues', () => {
  it('keeps a tokenless job and skips forked pull requests', async () => {
    const { yaml, script } = await loadEmberNotifyWorkflow()

    expect(yaml).toMatch(/^permissions:\s*\{\}\s*$/m)
    expect(yaml).toContain(
      'github.event.pull_request.head.repo.full_name == github.repository',
    )
    expect(script).toContain('def esc: gsub("&";"&"+"amp;")')
  })

  it('escapes issue text and keeps the first 300 characters of the body', async () => {
    const prefix = 'see <docs> & more'
    const result = await runEmberNotify('issues', {
      action: 'opened',
      issue: {
        number: 7,
        title: 'A & B <script>',
        body: prefix + 'a'.repeat(301 - prefix.length),
        html_url: 'https://github.com/senthilkumar979/victory/issues/7',
        labels: [{ name: 'bug & <fix>' }],
        assignees: [],
      },
      sender: { login: 'ada<&>' },
    })

    expect(result.status).toBe(0)
    expect(result.postedUrl).toBe(EMBER_DEV_URL)
    expect(result.payload?.text).toBe(
      `:memo: Issue 7 opened in *${EMBER_REPO}* by ada&lt;&amp;&gt;`,
    )
    const card = notifyAttachment(result)
    expect(card.color).toBe('#d53f8c')
    expect(card.title).toBe('#7 A &amp; B &lt;script&gt;')
    expect(card.text).toBe(
      `see &lt;docs&gt; &amp; more${'a'.repeat(300 - prefix.length)}`,
    )
    expect(card.fields).toEqual([
      { title: 'Labels', value: 'bug &amp; &lt;fix&gt;', short: true },
    ])
    expect(JSON.stringify(result.payload)).not.toContain('<script')
  })

  it('names the assignee when an issue is assigned', async () => {
    const result = await runEmberNotify('issues', {
      action: 'assigned',
      assignee: { login: 'sam' },
      issue: {
        number: 8,
        title: 'Task',
        body: null,
        html_url: 'https://github.com/senthilkumar979/victory/issues/8',
        labels: [],
        assignees: [{ login: 'sam' }],
      },
      sender: { login: 'ada' },
    })

    expect(result.postedUrl).toBe(EMBER_DEV_URL)
    expect(result.payload?.text).toContain('Issue 8 assigned to sam')
    expect(notifyAttachment(result).color).toBe('#0ea5e9')
    expect(notifyAttachment(result).fields).toEqual([
      { title: 'Assignees', value: 'sam', short: true },
    ])
  })

  it('does not post issue actions it does not handle', async () => {
    const result = await runEmberNotify('issues', {
      action: 'labeled',
      issue: { number: 1, title: 'x', html_url: 'https://github.com/x' },
      sender: { login: 'ada' },
    })

    expect(result.status).toBe(0)
    expect(result.payload).toBeNull()
    expect(result.stdout).toContain('issues/labeled: nothing to post')
  })
})
