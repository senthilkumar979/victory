import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCurrentUser, type ClerkUser } from '@/lib/auth/clerkUser'

const {
  clerkClientMock,
  currentUserMock,
  getUserMock,
  headersMock,
  verifyTokenMock,
} = vi.hoisted(() => ({
  clerkClientMock: vi.fn(),
  currentUserMock: vi.fn(),
  getUserMock: vi.fn(),
  headersMock: vi.fn(),
  verifyTokenMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@clerk/backend', () => ({ verifyToken: verifyTokenMock }))
vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: clerkClientMock,
  currentUser: currentUserMock,
}))
vi.mock('next/headers', () => ({ headers: headersMock }))

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CLERK_SECRET_KEY', 'test-secret')
    headersMock.mockResolvedValue(new Headers())
    clerkClientMock.mockResolvedValue({ users: { getUser: getUserMock } })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('authenticates a Bearer token without reading the cookie session', async () => {
    const bearerUser = createClerkUser('mobile-user')
    headersMock.mockResolvedValue(
      new Headers({ authorization: 'Bearer mobile-token' }),
    )
    verifyTokenMock.mockResolvedValue({ sub: bearerUser.id })
    getUserMock.mockResolvedValue(bearerUser)

    await expect(getCurrentUser()).resolves.toBe(bearerUser)
    expect(verifyTokenMock).toHaveBeenCalledWith('mobile-token', {
      secretKey: 'test-secret',
    })
    expect(getUserMock).toHaveBeenCalledWith(bearerUser.id)
    expect(currentUserMock).not.toHaveBeenCalled()
  })

  it('falls back to the cookie session when Bearer verification fails', async () => {
    const cookieUser = createClerkUser('web-user')
    headersMock.mockResolvedValue(
      new Headers({ authorization: 'Bearer expired-token' }),
    )
    verifyTokenMock.mockRejectedValue(new Error('expired'))
    currentUserMock.mockResolvedValue(cookieUser)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(getCurrentUser()).resolves.toBe(cookieUser)
    expect(currentUserMock).toHaveBeenCalledOnce()
  })

  it('returns null when Clerk middleware is absent and currentUser throws', async () => {
    currentUserMock.mockRejectedValue(new Error('auth() was not configured'))
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    await expect(getCurrentUser()).resolves.toBeNull()
    expect(consoleError).toHaveBeenCalledWith(
      '[getCurrentUser] currentUser() failed (middleware may be skipped)',
      expect.any(Error),
    )
  })
})

function createClerkUser(id: string): ClerkUser {
  return {
    id,
    emailAddresses: [],
    primaryEmailAddressId: null,
    publicMetadata: {},
  } as unknown as ClerkUser
}
