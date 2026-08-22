import { describe, expect, it } from 'vitest'

import { normalizeVisitorChatText } from './visitorChatTextNormalize'

describe('normalizeVisitorChatText', () => {
  it('repairs truncated URLs and the mentorbridge mail address', () => {
    expect(
      normalizeVisitorChatText(
        'Visit ttps://www.mentorbridge.in or ttp://example.com and write to ail@mentorbridge.in',
      ),
    ).toBe(
      'Visit https://www.mentorbridge.in or http://example.com and write to mail@mentorbridge.in',
    )
  })

  it('repairs dropped brackets on visitor-chat markers', () => {
    expect(
      normalizeVisitorChatText(
        '[NAME]] Ada [[/NAME]] [SKILL]] React [[/SKILL]] [COMPANY]] Acme [[/COMPANY]]',
      ),
    ).toBe(
      '[[NAME]] Ada [[/NAME]] [[SKILL]] React [[/SKILL]] [[COMPANY]] Acme [[/COMPANY]]',
    )
  })

  it('repairs common mentor-bio typos without changing already-correct text', () => {
    expect(
      normalizeVisitorChatText(
        'Role:oordinator Coordinatort MentorBridge. Technical Areas:is React. Contribution:is mentoring. Background:is teaching.',
      ),
    ).toBe(
      'Role: Coordinator Coordinator at MentorBridge. Technical Areas: His React. Contribution: His mentoring. Background: His teaching.',
    )

    expect(normalizeVisitorChatText('Role: Coordinator at MentorBridge')).toBe(
      'Role: Coordinator at MentorBridge',
    )
  })
})
