import { NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

const {
  createCalendarEventWithMeetMock,
  isAdminUserMock,
  requireAuthMock,
  resolveGoogleGroupEmailMock,
} = vi.hoisted(() => ({
  createCalendarEventWithMeetMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  requireAuthMock: vi.fn(),
  resolveGoogleGroupEmailMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/clerkUser', () => ({ isAdminUser: isAdminUserMock }))
vi.mock('@/lib/auth/requireAuth', () => ({ requireAuth: requireAuthMock }))
vi.mock('@/lib/googleCalendar', () => ({
  createCalendarEventWithMeet: createCalendarEventWithMeetMock,
}))
vi.mock('@/lib/googleGroups/resolveGoogleGroupEmail', () => ({
  resolveGoogleGroupEmail: resolveGoogleGroupEmailMock,
}))

function createRequest(body: unknown): Parameters<typeof POST>[0] {
  return new Request('http://localhost/api/meetings/create-google-meet', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  }) as Parameters<typeof POST>[0]
}

describe('POST /api/meetings/create-google-meet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'refresh-token')
    vi.stubEnv('GOOGLE_CALENDAR_ID', '')
    requireAuthMock.mockResolvedValue({
      context: { user: {}, email: 'admin@example.com' },
    })
    isAdminUserMock.mockReturnValue(true)
    resolveGoogleGroupEmailMock.mockImplementation(async (value?: string) =>
      value?.includes('@') ? value.trim() : null,
    )
    createCalendarEventWithMeetMock.mockResolvedValue(
      'https://meet.google.com/abc-defg-hij',
    )
  })

  it('returns the authentication response before processing the request', async () => {
    requireAuthMock.mockResolvedValue({
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await POST(createRequest({}))

    expect(response.status).toBe(401)
    expect(resolveGoogleGroupEmailMock).not.toHaveBeenCalled()
  })

  it('forbids authenticated non-admin users', async () => {
    isAdminUserMock.mockReturnValue(false)

    const response = await POST(createRequest({ title: 'Review', date: '2026-07-22' }))

    expect(response.status).toBe(403)
    expect(createCalendarEventWithMeetMock).not.toHaveBeenCalled()
  })

  it('returns 503 when Google Calendar is not configured', async () => {
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', ' ')

    const response = await POST(createRequest({ title: 'Review', date: '2026-07-22' }))

    expect(response.status).toBe(503)
    expect(createCalendarEventWithMeetMock).not.toHaveBeenCalled()
  })

  it('rejects requests without a resolvable invite recipient', async () => {
    resolveGoogleGroupEmailMock.mockResolvedValue(null)

    const response = await POST(
      createRequest({
        title: 'Review',
        date: '2026-07-22T10:00:00.000Z',
        attendees: ['legacy-group-id'],
      }),
    )

    expect(response.status).toBe(400)
    expect(createCalendarEventWithMeetMock).not.toHaveBeenCalled()
  })

  it('deduplicates resolved recipients and reports who received the invite', async () => {
    resolveGoogleGroupEmailMock.mockResolvedValue('cohort@googlegroups.com')

    const response = await POST(
      createRequest({
        title: '  Weekly Review  ',
        date: '2026-07-22T10:00:00.000Z',
        description: '  Progress check  ',
        attendees: ['cohort-id', 'cohort@googlegroups.com'],
        googleGroupId: 'cohort-id',
      }),
    )

    expect(response.status).toBe(200)
    expect(createCalendarEventWithMeetMock).toHaveBeenCalledWith('primary', {
      title: 'Weekly Review',
      date: '2026-07-22T10:00:00.000Z',
      description: 'Progress check',
      attendees: ['cohort@googlegroups.com'],
    })
    await expect(response.json()).resolves.toEqual({
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      inviteSentTo: ['cohort@googlegroups.com'],
    })
  })
})
