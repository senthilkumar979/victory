import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { clerkClientMock, currentUserMock, getUserMock, headersMock, verifyTokenMock } =
  vi.hoisted(() => ({
    clerkClientMock: vi.fn(),
    currentUserMock: vi.fn(),
    getUserMock: vi.fn(),
    headersMock: vi.fn(),
    verifyTokenMock: vi.fn(),
  }))

vi.mock('@clerk/backend', () => ({ verifyToken: verifyTokenMock }))
vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: clerkClientMock,
  currentUser: currentUserMock,
}))
vi.mock('next/headers', () => ({ headers: headersMock }))

import { getCurrentUser, type ClerkUser } from './clerkUser'

function createUser(id: string): ClerkUser {
  return {
    id,
    emailAddresses: [{ id: 'email-1', emailAddress: `${id}@example.com` }],
    primaryEmailAddressId: 'email-1',
    publicMetadata: {},
  } as ClerkUser
}

describe('getCurrentUser bearer fallthrough', () => {
  const cookieUser = createUser('cookie-user')

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubEnv('CLERK_SECRET_KEY', 'test-secret')
    headersMock.mockResolvedValue(new Headers())
    currentUserMock.mockResolvedValue(cookieUser)
    clerkClientMock.mockResolvedValue({ users: { getUser: getUserMock } })
    getUserMock.mockResolvedValue(createUser('bearer-user'))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('uses the cookie session when the Bearer token is invalid', async () => {
    headersMock.mockResolvedValue(new Headers({ authorization: 'Bearer bad-token' }))
    verifyTokenMock.mockRejectedValue(new Error('Invalid token'))

    await expect(getCurrentUser()).resolves.toBe(cookieUser)

    expect(verifyTokenMock).toHaveBeenCalledWith('bad-token', { secretKey: 'test-secret' })
    expect(getUserMock).not.toHaveBeenCalled()
    expect(currentUserMock).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(
      '[getCurrentUser] Bearer token verification failed',
      expect.any(Error),
    )
  })

  it.each([{}, { sub: '' }])(
    'uses the cookie session when the token subject is missing: %j',
    async (payload) => {
      headersMock.mockResolvedValue(new Headers({ authorization: 'Bearer no-sub' }))
      verifyTokenMock.mockResolvedValue(payload)

      await expect(getCurrentUser()).resolves.toBe(cookieUser)

      expect(getUserMock).not.toHaveBeenCalled()
      expect(clerkClientMock).not.toHaveBeenCalled()
      expect(currentUserMock).toHaveBeenCalledTimes(1)
      expect(console.error).not.toHaveBeenCalled()
    },
  )

  it('ignores a whitespace Bearer token and reads the cookie session', async () => {
    headersMock.mockResolvedValue(new Headers({ authorization: 'Bearer    ' }))

    await expect(getCurrentUser()).resolves.toBe(cookieUser)

    expect(verifyTokenMock).not.toHaveBeenCalled()
    expect(currentUserMock).toHaveBeenCalledTimes(1)
    expect(console.error).not.toHaveBeenCalled()
  })

  it('uses the cookie session when loading the Bearer user throws', async () => {
    headersMock.mockResolvedValue(new Headers({ authorization: 'Bearer good-token' }))
    verifyTokenMock.mockResolvedValue({ sub: 'user-bearer' })
    getUserMock.mockRejectedValue(new Error('clerk down'))

    await expect(getCurrentUser()).resolves.toBe(cookieUser)

    expect(getUserMock).toHaveBeenCalledWith('user-bearer')
    expect(currentUserMock).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(
      '[getCurrentUser] Bearer token verification failed',
      expect.any(Error),
    )
  })
})
