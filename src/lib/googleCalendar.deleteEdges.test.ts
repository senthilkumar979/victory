import { beforeEach, describe, expect, it, vi } from 'vitest'

const { calendarMock, listMock, deleteMock, setCredentialsMock } = vi.hoisted(
  () => ({
    calendarMock: vi.fn(),
    listMock: vi.fn(),
    deleteMock: vi.fn(),
    setCredentialsMock: vi.fn(),
  }),
)

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

async function loadDelete() {
  vi.resetModules()
  const { deleteCalendarEventByMeetLink } = await import('./googleCalendar')
  return deleteCalendarEventByMeetLink
}

describe('deleteCalendarEventByMeetLink edges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GOOGLE_CLIENT_ID', 'client-id')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'client-secret')
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'refresh-token')
    calendarMock.mockReturnValue({
      events: { list: listMock, delete: deleteMock },
    })
  })

  it('does not list events for a blank link or delete an event with no id', async () => {
    const deleteCalendarEventByMeetLink = await loadDelete()

    await expect(
      deleteCalendarEventByMeetLink('primary', '   ', '2026-08-22'),
    ).resolves.toBe(false)
    expect(listMock).not.toHaveBeenCalled()

    listMock.mockResolvedValue({
      data: {
        items: [{ hangoutLink: 'https://meet.google.com/abc-defg-hij' }],
      },
    })

    await expect(
      deleteCalendarEventByMeetLink(
        'primary',
        'https://meet.google.com/abc-defg-hij',
        '2026-08-22',
      ),
    ).resolves.toBe(false)
    expect(deleteMock).not.toHaveBeenCalled()
  })
})
