import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { authenticateMobileRequestMock, listMeetingsMock } = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  listMeetingsMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))

vi.mock('@/lib/mobile/meetingService', () => ({
  listMeetings: listMeetingsMock,
}))

import { GET } from './route'

describe('GET /api/mobile/v1/meetings', () => {
  beforeEach(() => {
    authenticateMobileRequestMock.mockReset()
    listMeetingsMock.mockReset()
  })

  it('does not query meetings when authentication fails', async () => {
    const authError = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileRequestMock.mockResolvedValue({ error: authError })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/meetings'),
    )

    expect(response).toBe(authError)
    expect(listMeetingsMock).not.toHaveBeenCalled()
  })

  it('forwards pagination and date filters for authenticated members', async () => {
    authenticateMobileRequestMock.mockResolvedValue({
      user: { id: 'student-1' },
      email: 'student@example.com',
      userId: 'student-1',
    })
    listMeetingsMock.mockResolvedValue({
      data: [{ id: 'meeting-1', title: 'Weekly meetup' }],
      pagination: { page: 3, limit: 10, totalCount: 1 },
    })

    const response = await GET(
      new Request(
        'http://localhost/api/mobile/v1/meetings?page=3&limit=10&from=2026-07-01&to=2026-07-31',
      ),
    )

    expect(response.status).toBe(200)
    expect(listMeetingsMock).toHaveBeenCalledWith(3, 10, {
      from: '2026-07-01',
      to: '2026-07-31',
    })
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'meeting-1', title: 'Weekly meetup' }],
      pagination: { page: 3, limit: 10, totalCount: 1 },
    })
  })
})
