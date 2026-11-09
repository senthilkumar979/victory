import { beforeEach, describe, expect, it, vi } from 'vitest'

const { dbState, getCurrentUserMock, getPrimaryEmailMock, isAdminUserMock } =
  vi.hoisted(() => ({
    dbState: { client: null as { from: ReturnType<typeof vi.fn> } | null },
    getCurrentUserMock: vi.fn(),
    getPrimaryEmailMock: vi.fn(),
    isAdminUserMock: vi.fn(),
  }))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/clerkUser', () => ({
  getCurrentUser: getCurrentUserMock,
  getPrimaryEmail: getPrimaryEmailMock,
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import { getStudentForEmail, requireAdmin, requireStudent } from './requireAuth'

const user = { id: 'user-1' }

describe('requireAdmin auth precedence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentUserMock.mockResolvedValue(null)
    getPrimaryEmailMock.mockReturnValue(null)
    isAdminUserMock.mockReturnValue(false)
  })

  it('returns 401 before checking the admin flag', async () => {
    const result = await requireAdmin()

    expect(isAdminUserMock).not.toHaveBeenCalled()
    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(401)
      await expect(result.response.json()).resolves.toEqual({
        error: 'Unauthorized',
      })
    }
  })

  it('returns the missing-email 403 before checking the admin flag', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue(null)

    const result = await requireAdmin()

    expect(isAdminUserMock).not.toHaveBeenCalled()
    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(403)
      await expect(result.response.json()).resolves.toEqual({
        error: 'No email on account',
      })
    }
  })
})

describe('requireStudent auth precedence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = null
    getCurrentUserMock.mockResolvedValue(null)
    getPrimaryEmailMock.mockReturnValue('student@example.com')
  })

  it('returns 401 when the database is not configured', async () => {
    const result = await requireStudent()

    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(401)
      await expect(result.response.json()).resolves.toEqual({
        error: 'Unauthorized',
      })
    }
  })

  it('returns the missing-email 403 without querying students', async () => {
    const from = vi.fn()
    dbState.client = { from }
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue(null)

    const result = await requireStudent()

    expect(from).not.toHaveBeenCalled()
    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(403)
      await expect(result.response.json()).resolves.toEqual({
        error: 'No email on account',
      })
    }
  })

  it('treats a blank student id as a missing profile', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: '', cohort_id: 'cohort-1' },
      error: null,
    })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ select })
    dbState.client = { from }
    getCurrentUserMock.mockResolvedValue(user)

    const result = await requireStudent()

    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(403)
      await expect(result.response.json()).resolves.toEqual({
        error: 'Student profile required.',
      })
    }
  })
})

describe('getStudentForEmail query errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = null
  })

  it('returns null when the lookup fails instead of throwing', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'timeout' },
    })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    dbState.client = { from: vi.fn().mockReturnValue({ select }) }

    await expect(getStudentForEmail('ada@example.com')).resolves.toBeNull()
  })
})
