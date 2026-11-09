import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileRequestMock,
  isAdminUserMock,
  getStudentForEmailMock,
} = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))

vi.mock('@/lib/auth/clerkUser', () => ({
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/auth/requireAuth', () => ({
  getStudentForEmail: getStudentForEmailMock,
}))

import { GET } from './route'

describe('GET /api/mobile/v1/me failure shapes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    authenticateMobileRequestMock.mockResolvedValue({
      user: {
        id: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        imageUrl: null,
        publicMetadata: {},
      },
      email: 'ada@example.com',
      userId: 'user-1',
    })
    isAdminUserMock.mockReturnValue(false)
    getStudentForEmailMock.mockResolvedValue(null)
  })

  it('hides a non-Error failure behind the generic internal message', async () => {
    authenticateMobileRequestMock.mockRejectedValue('socket hang up')

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: 'Unknown error',
    })
    expect(getStudentForEmailMock).not.toHaveBeenCalled()
  })

  it('returns a null linked student when the profile lookup finds nobody', async () => {
    const response = await GET()

    expect(getStudentForEmailMock).toHaveBeenCalledWith('ada@example.com')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      isAdmin: false,
      linkedStudent: null,
      user: { id: 'user-1', email: 'ada@example.com' },
    })
  })
})
