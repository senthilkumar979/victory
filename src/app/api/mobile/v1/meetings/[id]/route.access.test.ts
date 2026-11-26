import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextResponse } from 'next/server'

const { authenticateMobileRequestMock, getMeetingByIdMock } = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  getMeetingByIdMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: null }))
vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))
vi.mock('@/lib/mobile/meetingService', () => ({
  getMeetingById: getMeetingByIdMock,
}))

import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

import { GET } from './route'

const member = {
  user: { id: 'student-user' },
  email: 'student@example.com',
  userId: 'student-user',
}

function detailRequest() {
  return new Request('http://localhost:3001/api/mobile/v1/meetings/meeting-9')
}

describe('GET /api/mobile/v1/meetings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    authenticateMobileRequestMock.mockResolvedValue(member)
  })

  it('returns 404 when the meeting is missing', async () => {
    getMeetingByIdMock.mockRejectedValue(
      new MobileServiceError('Meeting not found', 404, 'NOT_FOUND'),
    )

    const response = await GET(detailRequest(), {
      params: Promise.resolve({ id: 'meeting-9' }),
    })

    expect(getMeetingByIdMock).toHaveBeenCalledWith('meeting-9')
    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: 'Meeting not found',
      code: 'NOT_FOUND',
      details: {},
    })
  })

  it('returns the auth error without loading the meeting', async () => {
    const error = NextResponse.json(
      { error: 'No email on account', code: 'FORBIDDEN' },
      { status: 403 },
    )
    authenticateMobileRequestMock.mockResolvedValue({ error })

    const response = await GET(detailRequest(), {
      params: Promise.resolve({ id: 'meeting-9' }),
    })

    expect(response).toBe(error)
    expect(getMeetingByIdMock).not.toHaveBeenCalled()
  })

  it('hides unexpected errors and omits details', async () => {
    getMeetingByIdMock.mockRejectedValue(new Error('connection string leaked'))

    const response = await GET(detailRequest(), {
      params: Promise.resolve({ id: 'meeting-9' }),
    })
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(JSON.stringify(body)).not.toContain('leaked')
  })
})
