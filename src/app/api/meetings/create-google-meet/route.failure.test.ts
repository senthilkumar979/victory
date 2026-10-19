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

vi.mock('@/lib/auth/clerkUser', () => ({ isAdminUser: isAdminUserMock }))
vi.mock('@/lib/auth/requireAuth', () => ({ requireAuth: requireAuthMock }))
vi.mock('@/lib/googleCalendar', () => ({
  createCalendarEventWithMeet: createCalendarEventWithMeetMock,
}))
vi.mock('@/lib/googleGroups/resolveGoogleGroupEmail', () => ({
  resolveGoogleGroupEmail: resolveGoogleGroupEmailMock,
}))

const OAUTH_MISMATCH =
  'OAuth credentials mismatch. Obtain a new refresh token from OAuth Playground using YOUR client ID/secret (gear icon → Use your own OAuth credentials).'

function createRequest(body: unknown, raw = false): Parameters<typeof POST>[0] {
  return new Request('http://localhost/api/meetings/create-google-meet', {
    method: 'POST',
    body: raw ? String(body) : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  }) as Parameters<typeof POST>[0]
}

describe('POST /api/meetings/create-google-meet failures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'refresh-token')
    vi.stubEnv('GOOGLE_CALENDAR_ID', '  team-cal  ')
    requireAuthMock.mockResolvedValue({
      context: { user: {}, email: 'admin@example.com' },
    })
    isAdminUserMock.mockReturnValue(true)
    resolveGoogleGroupEmailMock.mockImplementation(async (value: unknown) => {
      if (typeof value !== 'string') return null
      const trimmed = value.trim()
      if (trimmed === 'member@example.com') return trimmed
      if (trimmed === 'group-id') return 'cohort@example.com'
      return null
    })
    createCalendarEventWithMeetMock.mockResolvedValue(
      'https://meet.google.com/abc-defg-hij',
    )
  })

  it('rejects invalid JSON before resolving invitees', async () => {
    const response = await POST(createRequest('{', true))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' })
    expect(resolveGoogleGroupEmailMock).not.toHaveBeenCalled()
    expect(createCalendarEventWithMeetMock).not.toHaveBeenCalled()
  })

  it('rejects a missing title or a non-string date', async () => {
    const missingTitle = await POST(
      createRequest({ title: '', date: '2026-07-22T10:00:00.000Z' }),
    )
    const badDate = await POST(
      createRequest({ title: 'Standup', date: 20260722 }),
    )

    expect(missingTitle.status).toBe(400)
    expect(badDate.status).toBe(400)
    await expect(missingTitle.json()).resolves.toEqual({
      error: 'Missing or invalid required fields: title, date',
    })
    expect(createCalendarEventWithMeetMock).not.toHaveBeenCalled()
  })

  it('ignores non-string attendees and a non-string description', async () => {
    const response = await POST(
      createRequest({
        title: 'Standup',
        date: '2026-07-22T10:00:00.000Z',
        description: 12,
        attendees: ['  member@example.com ', 12, null],
        googleGroupId: 'group-id',
      }),
    )

    expect(resolveGoogleGroupEmailMock.mock.calls.map((call) => call[0])).toEqual([
      '  member@example.com ',
      'group-id',
    ])
    expect(createCalendarEventWithMeetMock).toHaveBeenCalledWith('team-cal', {
      title: 'Standup',
      date: '2026-07-22T10:00:00.000Z',
      description: undefined,
      attendees: ['member@example.com', 'cohort@example.com'],
    })
    expect(response.status).toBe(200)
  })

  it('treats a non-array attendees field as no extra recipients', async () => {
    const response = await POST(
      createRequest({
        title: 'Standup',
        date: '2026-07-22T10:00:00.000Z',
        attendees: 'member@example.com',
        googleGroupId: 'group-id',
      }),
    )

    expect(resolveGoogleGroupEmailMock).toHaveBeenCalledTimes(1)
    expect(resolveGoogleGroupEmailMock).toHaveBeenCalledWith('group-id')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      inviteSentTo: ['cohort@example.com'],
    })
  })

  it('returns 502 when Calendar creates a Meet without a link', async () => {
    createCalendarEventWithMeetMock.mockResolvedValue(null)

    const response = await POST(
      createRequest({
        title: 'Standup',
        date: '2026-07-22T10:00:00.000Z',
        googleGroupId: 'group-id',
      }),
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'Google Meet was created but no meeting link was returned',
    })
  })

  it('rewrites OAuth client mismatches to 401', async () => {
    createCalendarEventWithMeetMock.mockRejectedValue(
      new Error('unauthorized_client'),
    )

    const response = await POST(
      createRequest({
        title: 'Standup',
        date: '2026-07-22T10:00:00.000Z',
        googleGroupId: 'group-id',
      }),
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: OAUTH_MISMATCH })
    expect(console.error).toHaveBeenCalled()
  })

  it('treats a thrown 401 code as the same OAuth mismatch', async () => {
    createCalendarEventWithMeetMock.mockRejectedValue({ code: 401 })

    const response = await POST(
      createRequest({
        title: 'Standup',
        date: '2026-07-22T10:00:00.000Z',
        googleGroupId: 'group-id',
      }),
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: OAUTH_MISMATCH })
  })

  it('returns the provider message for other calendar failures', async () => {
    createCalendarEventWithMeetMock.mockRejectedValue(new Error('calendar down'))

    const response = await POST(
      createRequest({
        title: 'Standup',
        date: '2026-07-22T10:00:00.000Z',
        googleGroupId: 'group-id',
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'calendar down' })
  })

  it('uses a generic message when the failure is not an Error', async () => {
    createCalendarEventWithMeetMock.mockRejectedValue('nope')

    const response = await POST(
      createRequest({
        title: 'Standup',
        date: '2026-07-22T10:00:00.000Z',
        googleGroupId: 'group-id',
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to create Google Meet',
    })
  })
})
