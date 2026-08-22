import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { deleteByMeetLinkMock } = vi.hoisted(() => ({
  deleteByMeetLinkMock: vi.fn(),
}))

vi.mock('@/lib/googleCalendar', () => ({
  deleteCalendarEventByMeetLink: deleteByMeetLinkMock,
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/calendar/delete-by-meet-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

describe('POST /api/calendar/delete-by-meet-link', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteByMeetLinkMock.mockResolvedValue(true)
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'refresh-token')
    delete process.env.GOOGLE_CALENDAR_ID
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects invalid JSON and missing required fields', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON body',
    })

    const missingLink = await POST(makeRequest({ date: '2026-08-22' }))
    expect(missingLink.status).toBe(400)
    await expect(missingLink.json()).resolves.toEqual({
      error: 'Missing or invalid required field: meetingLink',
    })

    const missingDate = await POST(
      makeRequest({ meetingLink: 'https://meet.google.com/abc-defg-hij' }),
    )
    expect(missingDate.status).toBe(400)
    expect(deleteByMeetLinkMock).not.toHaveBeenCalled()
  })

  it('no-ops for non-Meet URLs without calling Google Calendar', async () => {
    const response = await POST(
      makeRequest({
        meetingLink: 'https://zoom.us/j/123',
        date: '2026-08-22',
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      deleted: false,
    })
    expect(deleteByMeetLinkMock).not.toHaveBeenCalled()
  })

  it('no-ops when GOOGLE_REFRESH_TOKEN is missing', async () => {
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', '   ')

    const response = await POST(
      makeRequest({
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        date: '2026-08-22',
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      deleted: false,
    })
    expect(deleteByMeetLinkMock).not.toHaveBeenCalled()
  })

  it('forwards trimmed Meet links and maps 404 vs generic failures', async () => {
    const success = await POST(
      makeRequest({
        meetingLink: '  https://meet.google.com/abc-defg-hij  ',
        date: '  2026-08-22  ',
      }),
    )

    expect(deleteByMeetLinkMock).toHaveBeenCalledWith(
      'primary',
      'https://meet.google.com/abc-defg-hij',
      '2026-08-22',
    )
    expect(success.status).toBe(200)
    await expect(success.json()).resolves.toEqual({
      success: true,
      deleted: true,
    })

    deleteByMeetLinkMock.mockRejectedValueOnce({ code: 404, message: 'gone' })
    const notFound = await POST(
      makeRequest({
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        date: '2026-08-22',
      }),
    )
    expect(notFound.status).toBe(404)
    await expect(notFound.json()).resolves.toEqual({ error: 'Event not found' })

    deleteByMeetLinkMock.mockRejectedValueOnce(new Error('backend unavailable'))
    const failed = await POST(
      makeRequest({
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        date: '2026-08-22',
      }),
    )
    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toEqual({
      error: 'Failed to delete from Google Calendar',
    })
  })
})
