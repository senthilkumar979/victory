import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCalendarEventWithMeet } from './googleCalendar'

const { calendarMock, insertMock, setCredentialsMock } = vi.hoisted(() => ({
  calendarMock: vi.fn(),
  insertMock: vi.fn(),
  setCredentialsMock: vi.fn(),
}))

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn(function OAuth2() {
        return { setCredentials: setCredentialsMock }
      }),
    },
    calendar: calendarMock,
  },
}))

describe('createCalendarEventWithMeet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GOOGLE_CLIENT_ID', 'client-id')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'client-secret')
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'refresh-token')
    calendarMock.mockReturnValue({ events: { insert: insertMock } })
    insertMock.mockResolvedValue({
      data: { hangoutLink: 'https://meet.google.com/abc-defg-hij' },
    })
  })

  it('trims attendees and asks Google Calendar to send every invite', async () => {
    const meetingLink = await createCalendarEventWithMeet('team-calendar', {
      title: 'Weekly Review',
      date: '2026-07-22T10:00:00.000Z',
      attendees: [' cohort@googlegroups.com ', '', 'mentor@example.com'],
    })

    expect(meetingLink).toBe('https://meet.google.com/abc-defg-hij')
    expect(insertMock).toHaveBeenCalledOnce()
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'team-calendar',
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: expect.objectContaining({
          attendees: [
            { email: 'cohort@googlegroups.com' },
            { email: 'mentor@example.com' },
          ],
        }),
      }),
    )
  })

  it('suppresses invite updates when there are no valid attendees', async () => {
    await createCalendarEventWithMeet('primary', {
      title: 'Internal Review',
      date: '2026-07-22T10:00:00.000Z',
      attendees: [' ', ''],
    })

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sendUpdates: 'none',
        requestBody: expect.objectContaining({ attendees: undefined }),
      }),
    )
  })
})
