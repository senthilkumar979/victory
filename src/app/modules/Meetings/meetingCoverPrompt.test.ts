import { describe, expect, it } from 'vitest'

import type { MeetingFormState } from './Meeting.types'
import {
  buildDefaultMeetingCoverPrompt,
  getMentorBridgeLogoUrl,
} from './meetingCoverPrompt'

function meeting(overrides: Partial<MeetingFormState> = {}): MeetingFormState {
  return {
    title: 'Weekly standup',
    date: '2026-03-15T09:30:00.000Z',
    googleGroupId: 'group-1',
    description: '',
    meetingLink: '',
    coverImageUrl: '',
    ...overrides,
  }
}

describe('meetingCoverPrompt', () => {
  it('exposes the long-logo blob URL used as the second image attachment', () => {
    expect(getMentorBridgeLogoUrl()).toContain('long-logo')
  })

  it('falls back to Untitled and omits a description block when none is provided', () => {
    const prompt = buildDefaultMeetingCoverPrompt(meeting({ title: '' }))

    expect(prompt).toContain('Meeting title: Untitled')
    expect(prompt).not.toContain('Session focus / description:')
    expect(prompt).toMatch(/Date & time \(IST\): .+ IST/)
    expect(prompt).toContain('#d53f8c')
  })

  it('strips HTML and truncates long descriptions to 600 characters', () => {
    const longPlain = 'B'.repeat(601)
    const prompt = buildDefaultMeetingCoverPrompt(
      meeting({ description: `<p>${longPlain}</p>` }),
    )

    expect(prompt).toContain('Session focus / description:')
    expect(prompt).toContain(`${'B'.repeat(600)}…`)
    expect(prompt).not.toContain('B'.repeat(601))
    expect(prompt).not.toContain('<p>')
  })

  it('keeps descriptions at the 600-character limit without an ellipsis', () => {
    const exact = 'C'.repeat(600)
    const prompt = buildDefaultMeetingCoverPrompt(meeting({ description: exact }))

    expect(prompt).toContain(exact)
    expect(prompt).not.toContain(`${exact}…`)
  })
})
