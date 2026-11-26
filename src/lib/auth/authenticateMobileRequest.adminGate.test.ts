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

import {
  authenticateMobileAdmin,
  authenticateMobileRequest,
} from './authenticateMobileRequest'

const user = { id: 'user-1' }

async function expectFailure(
  result: Awaited<ReturnType<typeof authenticateMobileAdmin>>,
  status: number,
  body: { error: string; code: string },
) {
  expect(result).toHaveProperty('error')
  if (!('error' in result)) return
  expect(result.error.status).toBe(status)
  await expect(result.error.json()).resolves.toEqual(body)
}

describe('mobile auth gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects a missing user before the admin check', async () => {
    getCurrentUserMock.mockResolvedValue(null)

    await expectFailure(await authenticateMobileAdmin(), 401, {
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
    })
    expect(getPrimaryEmailMock).not.toHaveBeenCalled()
    expect(isAdminUserMock).not.toHaveBeenCalled()
  })

  it('rejects a missing email as No email on account, not Forbidden', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue(null)

    await expectFailure(await authenticateMobileAdmin(), 403, {
      error: 'No email on account',
      code: 'FORBIDDEN',
    })
    expect(isAdminUserMock).not.toHaveBeenCalled()
  })

  it('rejects a signed-in student from admin-only routes', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('student@example.com')
    isAdminUserMock.mockReturnValue(false)

    await expectFailure(await authenticateMobileAdmin(), 403, {
      error: 'Forbidden',
      code: 'FORBIDDEN',
    })
  })

  it('allows an admin through and keeps the user id', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('admin@example.com')
    isAdminUserMock.mockReturnValue(true)

    await expect(authenticateMobileAdmin()).resolves.toEqual({
      user,
      email: 'admin@example.com',
      userId: 'user-1',
    })
  })

  it('allows a non-admin with an email through member routes', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('student@example.com')

    await expect(authenticateMobileRequest()).resolves.toEqual({
      user,
      email: 'student@example.com',
      userId: 'user-1',
    })
    expect(isAdminUserMock).not.toHaveBeenCalled()
  })
})
