import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { authenticateMobileAdminMock, getAdminDashboardMock } = vi.hoisted(
  () => ({
    authenticateMobileAdminMock: vi.fn(),
    getAdminDashboardMock: vi.fn(),
  }),
)

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))

vi.mock('@/lib/mobile/dashboardService', () => ({
  getAdminDashboard: getAdminDashboardMock,
}))

import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'
import { GET } from './route'

describe('GET /api/mobile/v1/admin/dashboard', () => {
  beforeEach(() => {
    authenticateMobileAdminMock.mockReset()
    getAdminDashboardMock.mockReset()
  })

  it('does not load the dashboard when the caller is not an admin', async () => {
    const forbidden = Response.json(
      { error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: forbidden })

    const response = await GET()

    expect(response).toBe(forbidden)
    expect(getAdminDashboardMock).not.toHaveBeenCalled()
  })

  it('wraps dashboard data for authenticated admins', async () => {
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    getAdminDashboardMock.mockResolvedValue({
      studentCount: 12,
      meetingsTodayCount: 1,
    })

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: { studentCount: 12, meetingsTodayCount: 1 },
    })
  })

  it('maps service errors to mobile error payloads', async () => {
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    getAdminDashboardMock.mockRejectedValue(
      new MobileServiceError(
        'Could not load dashboard.',
        500,
        'INTERNAL_ERROR',
      ),
    )

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Could not load dashboard.',
      code: 'INTERNAL_ERROR',
    })
  })
})
