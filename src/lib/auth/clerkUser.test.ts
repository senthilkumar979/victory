import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getCurrentUser,
  getPrimaryEmail,
  isAdminUser,
  type ClerkUser,
} from './clerkUser'

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

interface UserFixtureOptions {
  emailAddresses?: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId?: string | null
  publicMetadata?: Record<string, unknown>
}

function createUser(options: UserFixtureOptions = {}): ClerkUser {
  return {
    id: 'user-1',
    emailAddresses:
      options.emailAddresses ??
      [{ id: 'primary-email', emailAddress: 'admin@example.com' }],
    primaryEmailAddressId:
      options.primaryEmailAddressId === undefined
        ? 'primary-email'
        : options.primaryEmailAddressId,
    publicMetadata: options.publicMetadata ?? {},
  } as ClerkUser
}

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CLERK_SECRET_KEY', 'test-secret')
    headersMock.mockResolvedValue(new Headers())
    currentUserMock.mockResolvedValue(null)
    clerkClientMock.mockResolvedValue({ users: { getUser: getUserMock } })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('uses a valid Bearer token before checking the cookie session', async () => {
    const user = createUser()
    headersMock.mockResolvedValue(
      new Headers({ authorization: 'Bearer mobile-token' }),
    )
    verifyTokenMock.mockResolvedValue({ sub: user.id })
    getUserMock.mockResolvedValue(user)
    await expect(getCurrentUser()).resolves.toBe(user)
    expect(verifyTokenMock).toHaveBeenCalledWith('mobile-token', {
      secretKey: 'test-secret',
    })
    expect(getUserMock).toHaveBeenCalledWith(user.id)
    expect(currentUserMock).not.toHaveBeenCalled()
  })

  it('falls back to the cookie session when no Bearer token is present', async () => {
    const user = createUser()
    currentUserMock.mockResolvedValue(user)
    await expect(getCurrentUser()).resolves.toBe(user)
    expect(verifyTokenMock).not.toHaveBeenCalled()
    expect(currentUserMock).toHaveBeenCalledTimes(1)
  })

  it('returns null instead of throwing when both auth methods fail', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    headersMock.mockResolvedValue(
      new Headers({ authorization: 'Bearer invalid-token' }),
    )
    verifyTokenMock.mockRejectedValue(new Error('Invalid token'))
    currentUserMock.mockRejectedValue(new Error('Missing middleware'))
    await expect(getCurrentUser()).resolves.toBeNull()
  })

  it('does not verify a Bearer token without a Clerk secret', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubEnv('CLERK_SECRET_KEY', '')
    headersMock.mockResolvedValue(
      new Headers({ authorization: 'Bearer mobile-token' }),
    )
    await expect(getCurrentUser()).resolves.toBeNull()
    expect(verifyTokenMock).not.toHaveBeenCalled()
  })
})
describe('getPrimaryEmail', () => {
  it('selects the primary email even when it is not first', () => {
    const user = createUser({
      emailAddresses: [
        { id: 'secondary', emailAddress: 'secondary@example.com' },
        { id: 'primary', emailAddress: 'primary@example.com' },
      ],
      primaryEmailAddressId: 'primary',
    })
    expect(getPrimaryEmail(user)).toBe('primary@example.com')
  })

  it('falls back to the first email and handles an empty email list', () => {
    const fallbackUser = createUser({ primaryEmailAddressId: 'missing' })
    const noEmailUser = createUser({ emailAddresses: [] })
    expect(getPrimaryEmail(fallbackUser)).toBe('admin@example.com')
    expect(getPrimaryEmail(noEmailUser)).toBeNull()
  })
})

describe('isAdminUser', () => {
  it.each([
    { role: 'admin' },
    { role: ' ADMIN ' },
    { isAdmin: true },
    { isAdmin: 'true' },
    { isAdmin: 1 },
    { isAdmin: '1' },
  ])('accepts supported admin metadata: %o', (publicMetadata) => {
    expect(isAdminUser(createUser({ publicMetadata }))).toBe(true)
  })

  it.each([
    {},
    { role: 'student' },
    { isAdmin: false },
    { isAdmin: 'false' },
    { isAdmin: 0 },
  ])('rejects non-admin metadata: %o', (publicMetadata) => {
    expect(isAdminUser(createUser({ publicMetadata }))).toBe(false)
  })
})
