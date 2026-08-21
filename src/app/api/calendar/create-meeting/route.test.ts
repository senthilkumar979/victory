import { beforeEach, describe, expect, it, vi } from 'vitest'

const { listMock, insertMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  insertMock: vi.fn(),
}))

vi.mock('@/lib/googleCalendar', () => ({
  calendar: {
    events: {
      list: (...args: unknown[]) => listMock(...args),
      insert: (...args: unknown[]) => insertMock(...args),
    },
  },
  calendarConfig: { timeZone: 'Asia/Kolkata' },
  generateRequestId: () => 'req-1',
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/calendar/create-meeting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

const validBody = {
  title: '  Weekly sync  ',
  description: '  Agenda  ',
  startTime: '2026-08-21T10:00:00.000Z',
  endTime: '2026-08-21T11:00:00.000Z',
  attendees: ['ada@example.com', 12, 'bob@example.com'],
}

describe('POST /api/calendar/create-meeting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listMock.mockResolvedValue({ data: { items: [] } })
    insertMock.mockResolvedValue({
      data: {
        id: 'event-1',
        hangoutLink: 'https://meet.google.com/abc-defg-hij',
        htmlLink: 'https://calendar.google.com/event/1',
        start: { dateTime: validBody.startTime },
        end: { dateTime: validBody.endTime },
      },
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('rejects invalid JSON, missing title, and invalid date bounds', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON body',
    })

    const missingTitle = await POST(
      makeRequest({ ...validBody, title: '' }),
    )
    expect(missingTitle.status).toBe(400)
    await expect(missingTitle.json()).resolves.toEqual({
      error: 'Missing or invalid required field: title',
    })

    const badStart = await POST(
      makeRequest({ ...validBody, startTime: 'not-a-date' }),
    )
    expect(badStart.status).toBe(400)

    const inverted = await POST(
      makeRequest({
        ...validBody,
        startTime: '2026-08-21T11:00:00.000Z',
        endTime: '2026-08-21T10:00:00.000Z',
      }),
    )
    expect(inverted.status).toBe(400)
    await expect(inverted.json()).resolves.toEqual({
      error: 'endTime must be after startTime',
    })
    expect(listMock).not.toHaveBeenCalled()
  })

  it('returns 409 when the time slot is already booked', async () => {
    listMock.mockResolvedValue({ data: { items: [{ id: 'busy' }] } })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: 'Time slot already booked',
    })
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('creates the event, filters non-string attendees, and prefers hangoutLink', async () => {
    const response = await POST(makeRequest(validBody))

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: expect.objectContaining({
          summary: 'Weekly sync',
          description: 'Agenda',
          attendees: [
            { email: 'ada@example.com' },
            { email: 'bob@example.com' },
          ],
          conferenceData: {
            createRequest: {
              requestId: 'req-1',
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      }),
    )
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      eventId: 'event-1',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      htmlLink: 'https://calendar.google.com/event/1',
      start: validBody.startTime,
      end: validBody.endTime,
    })
  })

  it('falls back to the video conference URI and returns 502 without an event id', async () => {
    insertMock.mockResolvedValueOnce({
      data: {
        id: 'event-2',
        conferenceData: {
          entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/xyz' }],
        },
        htmlLink: '',
      },
    })

    const fallback = await POST(makeRequest(validBody))
    expect(fallback.status).toBe(201)
    await expect(fallback.json()).resolves.toMatchObject({
      eventId: 'event-2',
      meetLink: 'https://meet.google.com/xyz',
    })

    insertMock.mockResolvedValueOnce({ data: {} })
    const missingId = await POST(makeRequest(validBody))
    expect(missingId.status).toBe(502)
    await expect(missingId.json()).resolves.toEqual({
      error: 'Event created but no ID returned',
    })
  })
})
