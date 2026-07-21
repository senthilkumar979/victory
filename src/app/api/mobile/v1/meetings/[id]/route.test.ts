import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { authenticateMobileRequestMock, getMeetingByIdMock } = vi.hoisted(
  () => ({
    authenticateMobileRequestMock: vi.fn(),
    getMeetingByIdMock: vi.fn(),
  }),
)

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))

vi.mock('@/lib/mobile/meetingService', () => ({
  getMeetingById: getMeetingByIdMock,
}))

import { GET } from './route'

describe('GET /api/mobile/v1/meetings/[id]', () => {
  beforeEach(() => {
    authenticateMobileRequestMock.mockReset()
    getMeetingByIdMock.mockReset()
  })

  it('does not load a meeting when authentication fails', async () => {
    const authError = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileRequestMock.mockResolvedValue({ error: authError })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/meetings/meeting-1'),
      { params: Promise.resolve({ id: 'meeting-1' }) },
    )

    expect(response).toBe(authError)
    expect(getMeetingByIdMock).not.toHaveBeenCalled()
  })

  it('returns the requested meeting for an authenticated member', async () => {
    authenticateMobileRequestMock.mockResolvedValue({
      user: { id: 'student-1' },
      email: 'student@example.com',
      userId: 'student-1',
    })
    getMeetingByIdMock.mockResolvedValue({
      id: 'meeting-42',
      title: 'Weekly meetup',
    })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/meetings/meeting-42'),
      { params: Promise.resolve({ id: 'meeting-42' }) },
    )

    expect(response.status).toBe(200)
    expect(getMeetingByIdMock).toHaveBeenCalledWith('meeting-42')
    await expect(response.json()).resolves.toEqual({
      data: { id: 'meeting-42', title: 'Weekly meetup' },
    })
  })
})
