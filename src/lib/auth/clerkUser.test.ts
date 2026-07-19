import { verifyToken } from '@clerk/backend'
import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getCurrentUser,
  getPrimaryEmail,
  isAdminUser,
  type ClerkUser,
} from '@/lib/auth/clerkUser'

vi.mock('server-only', () => ({}))
vi.mock('@clerk/backend', () => ({ verifyToken: vi.fn() }))
vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(),
  currentUser: vi.fn(),
}))
vi.mock('next/headers', () => ({ headers: vi.fn() }))

const originalSecretKey = process.env.CLERK_SECRET_KEY

afterEach(() => {
  vi.clearAllMocks()
  if (originalSecretKey) process.env.CLERK_SECRET_KEY = originalSecretKey
  else delete process.env.CLERK_SECRET_KEY
})

describe('getCurrentUser', () => {
  it('uses the cookie user without inspecting a bearer token', async () => {
    const user = createUser()
    vi.mocked(currentUser).mockResolvedValue(user)

    await expect(getCurrentUser()).resolves.toBe(user)
    expect(headers).not.toHaveBeenCalled()
    expect(verifyToken).not.toHaveBeenCalled()
  })

  it('verifies a bearer token and loads its Clerk user', async () => {
    const user = createUser()
    const getUser = vi.fn().mockResolvedValue(user)
    process.env.CLERK_SECRET_KEY = 'secret'
    vi.mocked(currentUser).mockResolvedValue(null)
    vi.mocked(headers).mockResolvedValue(
      new Headers({ authorization: 'Bearer mobile-token' }) as never,
    )
    vi.mocked(verifyToken).mockResolvedValue({ sub: user.id } as never)
    vi.mocked(clerkClient).mockResolvedValue({ users: { getUser } } as never)

    await expect(getCurrentUser()).resolves.toBe(user)
    expect(verifyToken).toHaveBeenCalledWith('mobile-token', {
      secretKey: 'secret',
    })
    expect(getUser).toHaveBeenCalledWith(user.id)
  })

  it('rejects empty and unverifiable bearer credentials', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(currentUser).mockResolvedValue(null)
    vi.mocked(headers).mockResolvedValue(
      new Headers({ authorization: 'Bearer token' }) as never,
    )
    process.env.CLERK_SECRET_KEY = 'secret'
    vi.mocked(verifyToken).mockRejectedValue(new Error('invalid token'))

    await expect(getCurrentUser()).resolves.toBeNull()

    vi.mocked(headers).mockResolvedValue(
      new Headers({ authorization: 'Bearer   ' }) as never,
    )
    await expect(getCurrentUser()).resolves.toBeNull()
  })
})

describe('Clerk user helpers', () => {
  it('falls back to the first email and recognizes both admin metadata forms', () => {
    const user = createUser({
      primaryEmailAddressId: null,
      publicMetadata: { isAdmin: true },
    })

    expect(getPrimaryEmail(user)).toBe('admin@example.com')
    expect(isAdminUser(user)).toBe(true)
    expect(isAdminUser(createUser({ publicMetadata: { role: 'student' } }))).toBe(
      false,
    )
  })
})

function createUser(overrides: Partial<ClerkUser> = {}): ClerkUser {
  return {
    id: 'user-1',
    emailAddresses: [{ id: 'email-1', emailAddress: 'admin@example.com' }],
    primaryEmailAddressId: 'email-1',
    publicMetadata: { role: 'admin' },
    ...overrides,
  } as ClerkUser
}
