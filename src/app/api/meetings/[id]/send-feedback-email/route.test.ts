import { beforeEach, describe, expect, it, vi } from 'vitest'

const { sendMock, authMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  authMock: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}))

vi.mock('@/lib/meetingFeedbackEmail', () => ({
  sendMeetingFeedbackEmailForMeetingId: (...args: unknown[]) => sendMock(...args),
}))

import { NextRequest } from 'next/server'

import { POST } from './route'

const meetingId = 'meeting-1'
const routeContext = { params: Promise.resolve({ id: meetingId }) }

function makeRequest(body?: unknown) {
  if (body === undefined) {
    return new NextRequest(
      `http://localhost/api/meetings/${meetingId}/send-feedback-email`,
      { method: 'POST' },
    )
  }

  return new NextRequest(
    `http://localhost/api/meetings/${meetingId}/send-feedback-email`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    },
  )
}

describe('POST /api/meetings/[id]/send-feedback-email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'user-1' })
    sendMock.mockResolvedValue({ ok: true, sentAt: '2026-01-15T10:00:00.000Z' })
  })

  it('returns 401 and does not send when the caller is unauthenticated', async () => {
    authMock.mockResolvedValue({ userId: null })

    const response = await POST(makeRequest({ forceResend: true }), routeContext)

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('treats an empty or invalid body as forceResend=false', async () => {
    const empty = await POST(makeRequest(), routeContext)
    expect(empty.status).toBe(200)
    expect(sendMock).toHaveBeenCalledWith(meetingId, { forceResend: false })

    sendMock.mockClear()
    const invalidJson = await POST(makeRequest('{'), routeContext)
    expect(invalidJson.status).toBe(200)
    expect(sendMock).toHaveBeenCalledWith(meetingId, { forceResend: false })
  })

  it('forwards forceResend=true and returns sentAt on success', async () => {
    const response = await POST(makeRequest({ forceResend: true }), routeContext)

    expect(sendMock).toHaveBeenCalledWith(meetingId, { forceResend: true })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      sentAt: '2026-01-15T10:00:00.000Z',
    })
  })

  it('maps sender failures to the returned status and error', async () => {
    sendMock.mockResolvedValue({
      ok: false,
      error: 'Feedback email was already sent for this meeting',
      status: 409,
    })

    const response = await POST(makeRequest({}), routeContext)

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: 'Feedback email was already sent for this meeting',
    })
  })
})
