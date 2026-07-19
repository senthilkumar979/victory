import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/api/mobile/v1/me/route'

const {
  authenticateMobileRequestMock,
  getStudentForEmailMock,
  isAdminUserMock,
} = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
  isAdminUserMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))
vi.mock('@/lib/auth/clerkUser', () => ({ isAdminUser: isAdminUserMock }))
vi.mock('@/lib/auth/requireAuth', () => ({
  getStudentForEmail: getStudentForEmailMock,
}))

describe('GET /api/mobile/v1/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the authenticated user when the student lookup fails', async () => {
    const user = {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      imageUrl: 'https://example.com/ada.jpg',
      publicMetadata: { role: 'admin' },
    }
    authenticateMobileRequestMock.mockResolvedValue({
      user,
      email: 'ada@example.com',
      userId: user.id,
    })
    isAdminUserMock.mockReturnValue(true)
    getStudentForEmailMock.mockRejectedValue(new Error('database unavailable'))
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      user: {
        ...user,
        email: 'ada@example.com',
      },
      isAdmin: true,
      linkedStudent: null,
    })
    expect(consoleError).toHaveBeenCalledWith(
      '[mobile/v1/me] linked student lookup failed',
      expect.any(Error),
    )
  })

  it('returns a structured 500 response for an unexpected auth failure', async () => {
    authenticateMobileRequestMock.mockRejectedValue(
      new Error('Clerk is unavailable'),
    )
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: 'Clerk is unavailable',
    })
  })
})
