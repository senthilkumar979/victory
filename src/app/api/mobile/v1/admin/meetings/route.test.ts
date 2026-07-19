import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authenticateMobileAdmin: vi.fn(),
  listMeetings: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: mocks.authenticateMobileAdmin,
}))
vi.mock('@/lib/mobile/meetingService', () => ({
  createMeeting: vi.fn(),
  listMeetings: mocks.listMeetings,
}))

import { GET } from '@/app/api/mobile/v1/admin/meetings/route'

describe('GET /api/mobile/v1/admin/meetings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authenticateMobileAdmin.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    mocks.listMeetings.mockResolvedValue({
      data: [],
      pagination: {
        page: 3,
        limit: 10,
        totalCount: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    })
  })

  it('forwards pagination and date filters to the meeting service', async () => {
    const request = new Request(
      'http://localhost/api/mobile/v1/admin/meetings?page=3&limit=10&from=2026-07-01&to=2026-07-31',
    )

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mocks.listMeetings).toHaveBeenCalledWith(3, 10, {
      from: '2026-07-01',
      to: '2026-07-31',
    })
    await expect(response.json()).resolves.toMatchObject({
      pagination: { page: 3, limit: 10 },
    })
  })
})
