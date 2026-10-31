import { beforeEach, describe, expect, it, vi } from 'vitest'

const { calendarMock, insertMock, setCredentialsMock } = vi.hoisted(() => ({
  calendarMock: vi.fn(),
  insertMock: vi.fn(),
  setCredentialsMock: vi.fn(),
}))

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: function OAuth2() {
        return { setCredentials: setCredentialsMock }
      },
    },
    calendar: (...args: unknown[]) => calendarMock(...args),
  },
}))

const START = '2026-07-22T10:00:00.000Z'
const MEETING = { title: 'Review', date: START }

function stubGoogleEnv() {
  vi.stubEnv('GOOGLE_CLIENT_ID', 'client-id')
  vi.stubEnv('GOOGLE_CLIENT_SECRET', 'client-secret')
  vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'refresh-token')
}

function slot(dateTime: string, timeZone: string) {
  return { dateTime, timeZone }
}

async function loadCreate() {
  vi.resetModules()
  const { createCalendarEventWithMeet } = await import('./googleCalendar')
  return createCalendarEventWithMeet
}

describe('createCalendarEventWithMeet edges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stubGoogleEnv()
    calendarMock.mockReturnValue({ events: { insert: insertMock } })
    insertMock.mockResolvedValue({
      data: { hangoutLink: 'https://meet.google.com/abc-defg-hij' },
    })
  })

  it('throws before calling Calendar when OAuth env is missing', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', '')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '')
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', '')
    const createCalendarEventWithMeet = await loadCreate()

    await expect(createCalendarEventWithMeet('primary', MEETING)).rejects.toThrow(
      'Missing Google OAuth credentials: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN',
    )
    expect(calendarMock).not.toHaveBeenCalled()
  })

  it('trims the refresh token before storing OAuth credentials', async () => {
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', '  refresh-token  ')
    const createCalendarEventWithMeet = await loadCreate()

    await createCalendarEventWithMeet('primary', MEETING)

    expect(setCredentialsMock).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    })
  })

  it('rejects an invalid start and does not insert an event', async () => {
    const createCalendarEventWithMeet = await loadCreate()

    await expect(
      createCalendarEventWithMeet('primary', {
        title: 'Review',
        date: 'not-a-date',
      }),
    ).rejects.toThrow('Invalid date: not-a-date')
    expect(calendarMock).not.toHaveBeenCalled()
  })

  it('defaults to 120 minutes in Asia/Kolkata and honors overrides', async () => {
    const createCalendarEventWithMeet = await loadCreate()

    await createCalendarEventWithMeet('primary', {
      ...MEETING,
      description: 'Agenda',
    })
    await createCalendarEventWithMeet('primary', {
      ...MEETING,
      durationMinutes: 45,
      timeZone: 'America/New_York',
    })

    expect(insertMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        calendarId: 'primary',
        requestBody: expect.objectContaining({
          summary: 'Review',
          description: 'Agenda',
          start: slot(START, 'Asia/Kolkata'),
          end: slot('2026-07-22T12:00:00.000Z', 'Asia/Kolkata'),
        }),
      }),
    )
    expect(insertMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestBody: expect.objectContaining({
          description: undefined,
          start: slot(START, 'America/New_York'),
          end: slot('2026-07-22T10:45:00.000Z', 'America/New_York'),
        }),
      }),
    )
  })

  it('prefers hangoutLink, then a video entry point, otherwise null', async () => {
    const createCalendarEventWithMeet = await loadCreate()
    const create = () => createCalendarEventWithMeet('primary', MEETING)
    const video = {
      entryPointType: 'video',
      uri: 'https://meet.google.com/from-video',
    }
    const phone = { entryPointType: 'phone', uri: 'tel:+1' }

    insertMock.mockResolvedValueOnce({
      data: {
        hangoutLink: 'https://meet.google.com/from-hangout',
        conferenceData: { entryPoints: [video] },
      },
    })
    await expect(create()).resolves.toBe('https://meet.google.com/from-hangout')

    insertMock.mockResolvedValueOnce({
      data: { conferenceData: { entryPoints: [phone, video] } },
    })
    await expect(create()).resolves.toBe('https://meet.google.com/from-video')

    insertMock.mockResolvedValueOnce({
      data: { conferenceData: { entryPoints: [phone] } },
    })
    await expect(create()).resolves.toBeNull()
  })
})
