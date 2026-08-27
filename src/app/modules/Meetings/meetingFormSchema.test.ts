import { describe, expect, it } from 'vitest'

import { meetingFormSchema } from './meetingFormSchema'

const validMeeting = {
  title: 'Weekly sync',
  googleGroupId: 'team@googlegroups.com',
  date: '2026-06-01T12:00:00.000Z',
  description: 'Agenda',
  meetingLink: '',
  coverImageUrl: '',
}

describe('meetingFormSchema', () => {
  it('accepts a complete meeting and empty optional links', () => {
    const result = meetingFormSchema.safeParse(validMeeting)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.meetingLink).toBe('')
      expect(result.data.coverImageUrl).toBe('')
    }
  })

  it('rejects a missing or whitespace-only Google Group', () => {
    expect(
      meetingFormSchema.safeParse({ ...validMeeting, googleGroupId: '' }).success,
    ).toBe(false)
    expect(
      meetingFormSchema.safeParse({ ...validMeeting, googleGroupId: '   ' })
        .success,
    ).toBe(false)
  })

  it('rejects an unparseable date after trim', () => {
    const result = meetingFormSchema.safeParse({
      ...validMeeting,
      date: '  not-a-date  ',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Date and time must be valid')
    }
  })

  it('trims required text fields before validating', () => {
    const result = meetingFormSchema.safeParse({
      ...validMeeting,
      title: '  Weekly sync  ',
      googleGroupId: '  team@googlegroups.com  ',
      description: '  Agenda  ',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        title: 'Weekly sync',
        googleGroupId: 'team@googlegroups.com',
        date: '2026-06-01T12:00:00.000Z',
        description: 'Agenda',
        meetingLink: '',
        coverImageUrl: '',
      })
    }
  })
})
