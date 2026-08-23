import { describe, expect, it } from 'vitest'

import { parseAssistantVisitorMessage } from './parseAssistantVisitorMessage'

describe('parseAssistantVisitorMessage', () => {
  it('returns no segments for blank content', () => {
    expect(parseAssistantVisitorMessage('   ')).toEqual([])
  })

  it('splits marker blocks from surrounding body copy', () => {
    const segments = parseAssistantVisitorMessage(
      [
        'Welcome to MentorBridge.',
        '[[MB_CONTACT]]Reach out at hello@mentorbridge.in[[/MB_CONTACT]]',
        '[[MB_EXPLORE]]Browse placements and students on the site.[[/MB_EXPLORE]]',
      ].join('\n\n'),
    )

    expect(segments).toEqual([
      { type: 'body', text: 'Welcome to MentorBridge.' },
      { type: 'contact', text: 'Reach out at hello@mentorbridge.in' },
      { type: 'explore', text: 'Browse placements and students on the site.' },
    ])
  })

  it('heuristically tags contact and explore paragraphs without markers', () => {
    const segments = parseAssistantVisitorMessage(
      [
        'MentorBridge helps students land roles.',
        'You can reach out by email at team@mentorbridge.in for more depth.',
        'Explore the placements and students section on this website.',
      ].join('\n\n'),
    )

    expect(segments.map((s) => s.type)).toEqual(['body', 'contact', 'explore'])
  })

  it('merges adjacent body segments and ignores oversized hint-like paragraphs', () => {
    const long = `Please contact us at help@mentorbridge.in ${'x'.repeat(500)}`
    const segments = parseAssistantVisitorMessage(
      ['First paragraph.', 'Second paragraph continues.', long].join('\n\n'),
    )

    expect(segments).toHaveLength(1)
    expect(segments[0]).toEqual({
      type: 'body',
      text: ['First paragraph.', 'Second paragraph continues.', long].join('\n\n'),
    })
  })
})
