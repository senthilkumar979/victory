import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { authenticateMobileRequestMock, getMeetingByIdMock } = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  getMeetingByIdMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))

vi.mock('@/lib/mobile/meetingService', () => ({
  getMeetingById: getMeetingByIdMock,
}))

import { GET } from './route'
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

describe('GET /api/mobile/v1/meetings/[id] failures', () => {
  beforeEach(() => {
    authenticateMobileRequestMock.mockReset()
    getMeetingByIdMock.mockReset()
    authenticateMobileRequestMock.mockResolvedValue({
      user: { id: 'student-1' },
      email: 'student@example.com',
      userId: 'student-1',
    })
  })

  it('returns not found when the meeting does not exist', async () => {
    getMeetingByIdMock.mockRejectedValue(
      new MobileServiceError('Meeting not found', 404, 'NOT_FOUND'),
    )

    const response = await GET(new Request('http://localhost/api/mobile/v1/meetings/missing'), {
      params: Promise.resolve({ id: 'missing' }),
    })

    expect(getMeetingByIdMock).toHaveBeenCalledWith('missing')
    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: 'Meeting not found',
      code: 'NOT_FOUND',
      details: {},
    })
  })

  it('hides unexpected failures behind a generic 500', async () => {
    getMeetingByIdMock.mockRejectedValue(new Error('connection reset'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await GET(new Request('http://localhost/api/mobile/v1/meetings/meeting-1'), {
      params: Promise.resolve({ id: 'meeting-1' }),
    })

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
