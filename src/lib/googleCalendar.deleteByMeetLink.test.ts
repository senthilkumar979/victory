import { beforeEach, describe, expect, it, vi } from 'vitest'

const { listMock, deleteMock, setCredentialsMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  deleteMock: vi.fn(),
  setCredentialsMock: vi.fn(),
}))

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: function OAuth2() {
        return { setCredentials: setCredentialsMock }
      },
    },
    calendar: () => ({
      events: {
        list: (...args: unknown[]) => listMock(...args),
        delete: (...args: unknown[]) => deleteMock(...args),
      },
    }),
  },
}))

process.env.GOOGLE_CLIENT_ID = 'client-id'
process.env.GOOGLE_CLIENT_SECRET = 'client-secret'
process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token'

import { deleteCalendarEventByMeetLink } from './googleCalendar'

describe('deleteCalendarEventByMeetLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listMock.mockResolvedValue({ data: { items: [] } })
    deleteMock.mockResolvedValue({})
  })

  it('returns false for non-Meet URLs and invalid dates without listing events', async () => {
    await expect(
      deleteCalendarEventByMeetLink(
        'primary',
        'https://zoom.us/j/1',
        '2026-08-22',
      ),
    ).resolves.toBe(false)

    await expect(
      deleteCalendarEventByMeetLink(
        'primary',
        'https://meet.google.com/abc-defg-hij',
        'not-a-date',
      ),
    ).resolves.toBe(false)

    expect(listMock).not.toHaveBeenCalled()
  })

  it('matches hangout links ignoring case and trailing slashes', async () => {
    listMock.mockResolvedValue({
      data: {
        items: [
          {
            id: 'evt-1',
            hangoutLink: 'https://meet.google.com/ABC-defg-HIJ/',
          },
        ],
      },
    })

    await expect(
      deleteCalendarEventByMeetLink(
        'cal-1',
        'https://meet.google.com/abc-defg-hij',
        '2026-08-22T10:00:00.000Z',
      ),
    ).resolves.toBe(true)

    expect(deleteMock).toHaveBeenCalledWith({
      calendarId: 'cal-1',
      eventId: 'evt-1',
      sendUpdates: 'all',
    })
  })

  it('matches conference video entry points and returns false when nothing matches', async () => {
    listMock.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: 'evt-2',
            conferenceData: {
              entryPoints: [
                { entryPointType: 'phone', uri: 'tel:+1' },
                {
                  entryPointType: 'video',
                  uri: 'https://meet.google.com/xyz-abcd-efg',
                },
              ],
            },
          },
        ],
      },
    })

    await expect(
      deleteCalendarEventByMeetLink(
        'primary',
        'https://meet.google.com/xyz-abcd-efg',
        '2026-08-22',
      ),
    ).resolves.toBe(true)
    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'evt-2' }),
    )

    listMock.mockResolvedValueOnce({
      data: {
        items: [{ id: 'evt-3', hangoutLink: 'https://meet.google.com/other' }],
      },
    })

    await expect(
      deleteCalendarEventByMeetLink(
        'primary',
        'https://meet.google.com/abc-defg-hij',
        '2026-08-22',
      ),
    ).resolves.toBe(false)
    expect(deleteMock).toHaveBeenCalledTimes(1)
  })
})
