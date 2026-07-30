import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  authenticateMobileAdmin,
  authenticateMobileRequest,
} from './authenticateMobileRequest'

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

const user = { id: 'user-1' }

describe('authenticateMobileRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('admin@example.com')
  })

  it('returns a 401 response when no authenticated user exists', async () => {
    getCurrentUserMock.mockResolvedValue(null)

    const result = await authenticateMobileRequest()

    expect('error' in result).toBe(true)
    if (!('error' in result)) throw new Error('Expected authentication failure')
    expect(result.error.status).toBe(401)
    await expect(result.error.json()).resolves.toEqual({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
    })
  })

  it('returns a 403 response when the account has no email', async () => {
    getPrimaryEmailMock.mockReturnValue(null)

    const result = await authenticateMobileRequest()

    expect('error' in result).toBe(true)
    if (!('error' in result)) throw new Error('Expected authentication failure')
    expect(result.error.status).toBe(403)
    await expect(result.error.json()).resolves.toEqual({
      error: 'No email on account',
      code: 'FORBIDDEN',
    })
  })

  it('returns the identity used by mobile services', async () => {
    const result = await authenticateMobileRequest()

    expect(result).toEqual({
      user,
      email: 'admin@example.com',
      userId: 'user-1',
    })
  })
})

describe('authenticateMobileAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('admin@example.com')
    isAdminUserMock.mockReturnValue(false)
  })

  it('returns a 403 response for an authenticated non-admin', async () => {
    const result = await authenticateMobileAdmin()

    expect('error' in result).toBe(true)
    if (!('error' in result)) throw new Error('Expected authorization failure')
    expect(result.error.status).toBe(403)
    await expect(result.error.json()).resolves.toEqual({
      error: 'Forbidden',
      code: 'FORBIDDEN',
    })
  })

  it('returns the authenticated identity for an admin', async () => {
    isAdminUserMock.mockReturnValue(true)

    await expect(authenticateMobileAdmin()).resolves.toEqual({
      user,
      email: 'admin@example.com',
      userId: 'user-1',
    })
  })
})
