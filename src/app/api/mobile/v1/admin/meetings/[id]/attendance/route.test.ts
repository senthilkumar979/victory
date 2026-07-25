import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileAdminMock,
  updateMeetingAttendanceMock,
  mobileErrorResponseMock,
} = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  updateMeetingAttendanceMock: vi.fn(),
  mobileErrorResponseMock: vi.fn((err: unknown) =>
    Response.json(
      {
        error: err instanceof Error ? err.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 },
    ),
  ),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))

vi.mock('@/lib/mobile/meetingService', () => ({
  updateMeetingAttendance: updateMeetingAttendanceMock,
}))

vi.mock('@/lib/mobile/mobileApiUtils', () => ({
  mobileErrorResponse: mobileErrorResponseMock,
}))

import { PATCH } from './route'

describe('PATCH /api/mobile/v1/admin/meetings/[id]/attendance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('short-circuits before updating attendance when admin auth fails', async () => {
    const unauthorized = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: unauthorized })

    const response = await PATCH(
      new Request('http://localhost/attendance', {
        method: 'PATCH',
        body: JSON.stringify({ attendance: [1, 2] }),
      }),
      { params: Promise.resolve({ id: 'meeting-1' }) },
    )

    expect(response).toBe(unauthorized)
    expect(updateMeetingAttendanceMock).not.toHaveBeenCalled()
  })

  it('rejects non-array attendance payloads with a validation error', async () => {
    const response = await PATCH(
      new Request('http://localhost/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: '1,2,3' }),
      }),
      { params: Promise.resolve({ id: 'meeting-1' }) },
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'attendance must be an array',
      code: 'VALIDATION_ERROR',
    })
    expect(updateMeetingAttendanceMock).not.toHaveBeenCalled()
  })

  it('forwards the meeting id and attendance array to the service', async () => {
    updateMeetingAttendanceMock.mockResolvedValue({
      id: 'meeting-1',
      attendance: [1, 4],
    })

    const response = await PATCH(
      new Request('http://localhost/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: [4, 1] }),
      }),
      { params: Promise.resolve({ id: 'meeting-1' }) },
    )

    expect(updateMeetingAttendanceMock).toHaveBeenCalledWith('meeting-1', [4, 1])
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: { id: 'meeting-1', attendance: [1, 4] },
    })
  })

  it('maps service failures through mobileErrorResponse', async () => {
    const failure = new Error('Meeting not found')
    updateMeetingAttendanceMock.mockRejectedValue(failure)

    const response = await PATCH(
      new Request('http://localhost/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: [1] }),
      }),
      { params: Promise.resolve({ id: 'missing' }) },
    )

    expect(mobileErrorResponseMock).toHaveBeenCalledWith(failure)
    expect(response.status).toBe(500)
  })
})
