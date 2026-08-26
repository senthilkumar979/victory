import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { authenticateMobileRequestMock, listAnnouncementsMock } = vi.hoisted(
  () => ({
    authenticateMobileRequestMock: vi.fn(),
    listAnnouncementsMock: vi.fn(),
  }),
)

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))

vi.mock('@/lib/mobile/announcementService', () => ({
  listAnnouncements: listAnnouncementsMock,
}))

import { GET } from './route'

describe('GET /api/mobile/v1/announcements', () => {
  beforeEach(() => {
    authenticateMobileRequestMock.mockReset()
    listAnnouncementsMock.mockReset()
  })

  it('does not list announcements when authentication fails', async () => {
    const authError = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileRequestMock.mockResolvedValue({ error: authError })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/announcements'),
    )

    expect(response).toBe(authError)
    expect(listAnnouncementsMock).not.toHaveBeenCalled()
  })

  it('forwards pagination for authenticated students and admins', async () => {
    authenticateMobileRequestMock.mockResolvedValue({
      user: { id: 'student-1' },
      email: 'student@example.com',
      userId: 'student-1',
    })
    listAnnouncementsMock.mockResolvedValue({
      data: [{ id: 'a1', title: 'Office hours' }],
      pagination: { page: 2, limit: 5, totalCount: 1 },
    })

    const response = await GET(
      new Request(
        'http://localhost/api/mobile/v1/announcements?page=2&limit=5',
      ),
    )

    expect(listAnnouncementsMock).toHaveBeenCalledWith(2, 5)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'a1', title: 'Office hours' }],
      pagination: { page: 2, limit: 5, totalCount: 1 },
    })
  })
})
