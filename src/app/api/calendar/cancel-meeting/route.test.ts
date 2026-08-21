import { beforeEach, describe, expect, it, vi } from 'vitest'

const { deleteMock } = vi.hoisted(() => ({
  deleteMock: vi.fn(),
}))

vi.mock('@/lib/googleCalendar', () => ({
  calendar: {
    events: {
      delete: (...args: unknown[]) => deleteMock(...args),
    },
  },
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/calendar/cancel-meeting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

describe('POST /api/calendar/cancel-meeting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteMock.mockResolvedValue({})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('rejects invalid JSON and missing event ids', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON body',
    })

    const missing = await POST(makeRequest({ eventId: '   ' }))
    expect(missing.status).toBe(400)
    await expect(missing.json()).resolves.toEqual({
      error: 'Missing or invalid required field: eventId',
    })
    expect(deleteMock).not.toHaveBeenCalled()
  })

  it('trims the event id before deleting', async () => {
    const response = await POST(makeRequest({ eventId: '  event-9  ' }))

    expect(deleteMock).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event-9',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
  })

  it('maps Google 404 errors to Event not found', async () => {
    deleteMock.mockRejectedValueOnce({ code: 404, message: 'gone' })

    const byCode = await POST(makeRequest({ eventId: 'event-9' }))
    expect(byCode.status).toBe(404)
    await expect(byCode.json()).resolves.toEqual({ error: 'Event not found' })

    deleteMock.mockRejectedValueOnce(new Error('Not Found 404'))
    const byMessage = await POST(makeRequest({ eventId: 'event-9' }))
    expect(byMessage.status).toBe(404)

    deleteMock.mockRejectedValueOnce(new Error('backend unavailable'))
    const other = await POST(makeRequest({ eventId: 'event-9' }))
    expect(other.status).toBe(500)
    await expect(other.json()).resolves.toEqual({
      error: 'Failed to cancel meeting',
    })
  })
})
