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

import { GET } from './route'

describe('GET /api/mobile/v1/admin/dashboard unexpected failures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('returns a generic 500 when the dashboard throws a non-service error', async () => {
    getAdminDashboardMock.mockRejectedValue(new Error('database password'))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(JSON.stringify(body)).not.toContain('database password')
  })

  it('returns the same generic 500 when the thrown value is not an Error', async () => {
    getAdminDashboardMock.mockRejectedValue('socket hang up')

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
  })
})
