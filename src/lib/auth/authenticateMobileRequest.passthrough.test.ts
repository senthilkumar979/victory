import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCurrentUserMock, getPrimaryEmailMock, isAdminUserMock } = vi.hoisted(
  () => ({
    getCurrentUserMock: vi.fn(),
    getPrimaryEmailMock: vi.fn(),
    isAdminUserMock: vi.fn(),
  }),
)

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/clerkUser', () => ({
  getCurrentUser: getCurrentUserMock,
  getPrimaryEmail: getPrimaryEmailMock,
  isAdminUser: isAdminUserMock,
}))

import { authenticateMobileAdmin } from './authenticateMobileRequest'

const user = { id: 'user-1' }

describe('authenticateMobileAdmin auth precedence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentUserMock.mockResolvedValue(null)
    getPrimaryEmailMock.mockReturnValue(null)
    isAdminUserMock.mockReturnValue(false)
  })

  it('returns 401 before checking the admin flag', async () => {
    const result = await authenticateMobileAdmin()

    expect(isAdminUserMock).not.toHaveBeenCalled()
    expect('error' in result).toBe(true)
    if (!('error' in result)) throw new Error('Expected authentication failure')
    expect(result.error.status).toBe(401)
    await expect(result.error.json()).resolves.toEqual({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
    })
  })

  it('keeps the missing-email response distinct from a non-admin denial', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue(null)

    const result = await authenticateMobileAdmin()

    expect(isAdminUserMock).not.toHaveBeenCalled()
    expect('error' in result).toBe(true)
    if (!('error' in result)) throw new Error('Expected authentication failure')
    expect(result.error.status).toBe(403)
    await expect(result.error.json()).resolves.toEqual({
      error: 'No email on account',
      code: 'FORBIDDEN',
    })
  })
})
