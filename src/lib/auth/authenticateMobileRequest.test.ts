import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  authenticateMobileAdmin,
  authenticateMobileRequest,
} from '@/lib/auth/authenticateMobileRequest'
import {
  getCurrentUser,
  getPrimaryEmail,
  isAdminUser,
  type ClerkUser,
} from '@/lib/auth/clerkUser'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/clerkUser', () => ({
  getCurrentUser: vi.fn(),
  getPrimaryEmail: vi.fn(),
  isAdminUser: vi.fn(),
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('authenticateMobileRequest', () => {
  it('returns 401 when no authenticated Clerk user exists', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const result = await authenticateMobileRequest()

    expect('error' in result).toBe(true)
    if (!('error' in result)) throw new Error('Expected authentication failure')
    expect(result.error.status).toBe(401)
    await expect(result.error.json()).resolves.toEqual({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
    })
  })

  it('returns 403 when the account has no usable email', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(createUser())
    vi.mocked(getPrimaryEmail).mockReturnValue(null)

    const result = await authenticateMobileRequest()

    if (!('error' in result)) throw new Error('Expected authentication failure')
    expect(result.error.status).toBe(403)
    await expect(result.error.json()).resolves.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it('returns the normalized mobile identity for an authenticated user', async () => {
    const user = createUser()
    vi.mocked(getCurrentUser).mockResolvedValue(user)
    vi.mocked(getPrimaryEmail).mockReturnValue('admin@example.com')

    await expect(authenticateMobileRequest()).resolves.toEqual({
      user,
      email: 'admin@example.com',
      userId: 'user-1',
    })
  })
})

describe('authenticateMobileAdmin', () => {
  it('denies authenticated non-admin users', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(createUser())
    vi.mocked(getPrimaryEmail).mockReturnValue('student@example.com')
    vi.mocked(isAdminUser).mockReturnValue(false)

    const result = await authenticateMobileAdmin()

    if (!('error' in result)) throw new Error('Expected authorization failure')
    expect(result.error.status).toBe(403)
    await expect(result.error.json()).resolves.toEqual({
      error: 'Forbidden',
      code: 'FORBIDDEN',
    })
  })

  it('allows authenticated admins', async () => {
    const user = createUser()
    vi.mocked(getCurrentUser).mockResolvedValue(user)
    vi.mocked(getPrimaryEmail).mockReturnValue('admin@example.com')
    vi.mocked(isAdminUser).mockReturnValue(true)

    await expect(authenticateMobileAdmin()).resolves.toMatchObject({
      user,
      email: 'admin@example.com',
      userId: 'user-1',
    })
  })
})

function createUser(): ClerkUser {
  return { id: 'user-1' } as ClerkUser
}
