import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextResponse } from 'next/server'

const { authenticateMobileRequestMock, listMeetingsMock } = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  listMeetingsMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: null }))
vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))
vi.mock('@/lib/mobile/meetingService', () => ({
  listMeetings: listMeetingsMock,
}))

import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

import { GET } from './route'

const member = {
  user: { id: 'student-user' },
  email: 'student@example.com',
  userId: 'student-user',
}

function meetingsRequest(query = '') {
  return new Request(`http://localhost:3001/api/mobile/v1/meetings${query}`)
}

describe('GET /api/mobile/v1/meetings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    authenticateMobileRequestMock.mockResolvedValue(member)
    listMeetingsMock.mockResolvedValue({ data: [], pagination: { page: 1 } })
  })

  it('forwards omitted date bounds as undefined', async () => {
    const response = await GET(meetingsRequest())

    expect(response.status).toBe(200)
    expect(listMeetingsMock).toHaveBeenCalledWith(1, 20, {
      from: undefined,
      to: undefined,
    })
  })

  it('forwards empty date bounds as empty strings', async () => {
    await GET(meetingsRequest('?from=&to='))

    expect(listMeetingsMock).toHaveBeenCalledWith(1, 20, { from: '', to: '' })
  })

  it('forwards an explicit page, limit, and date window', async () => {
    await GET(
      meetingsRequest('?page=2&limit=5&from=2026-01-01&to=2026-01-31'),
    )

    expect(listMeetingsMock).toHaveBeenCalledWith(2, 5, {
      from: '2026-01-01',
      to: '2026-01-31',
    })
  })

  it('returns the auth error without listing meetings', async () => {
    const error = NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileRequestMock.mockResolvedValue({ error })

    const response = await GET(meetingsRequest('?from=2026-01-01'))

    expect(response).toBe(error)
    expect(listMeetingsMock).not.toHaveBeenCalled()
  })

  it('preserves a mobile service error', async () => {
    listMeetingsMock.mockRejectedValue(
      new MobileServiceError('Could not load meetings.', 500, 'INTERNAL_ERROR'),
    )

    const response = await GET(meetingsRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load meetings.',
      code: 'INTERNAL_ERROR',
      details: {},
    })
  })

  it('hides unexpected errors and omits details', async () => {
    listMeetingsMock.mockRejectedValue('database password')

    const response = await GET(meetingsRequest())
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(body).not.toHaveProperty('details')
    expect(JSON.stringify(body)).not.toContain('password')
  })
})
