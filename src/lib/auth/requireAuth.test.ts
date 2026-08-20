import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  dbState,
  getCurrentUserMock,
  getPrimaryEmailMock,
  isAdminUserMock,
} = vi.hoisted(() => ({
  dbState: { client: null as unknown },
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

import {
  getStudentForEmail,
  requireAdmin,
  requireAuth,
  requireStudent,
} from './requireAuth'

const user = { id: 'user-1' }

function mockStudentQuery(result: {
  data: { id?: string; cohort_id?: string | null } | null
  error: { message: string } | null
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  dbState.client = { from }
  return { from, select, eq, maybeSingle }
}

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = null
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('student@example.com')
    isAdminUserMock.mockReturnValue(false)
  })

  it('returns 401 when no session user is present', async () => {
    getCurrentUserMock.mockResolvedValue(null)

    const result = await requireAuth()

    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(401)
      await expect(result.response.json()).resolves.toEqual({
        error: 'Unauthorized',
      })
    }
    expect(getPrimaryEmailMock).not.toHaveBeenCalled()
  })

  it('returns 403 when the account has no email', async () => {
    getPrimaryEmailMock.mockReturnValue(null)

    const result = await requireAuth()

    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(403)
      await expect(result.response.json()).resolves.toEqual({
        error: 'No email on account',
      })
    }
  })

  it('returns the user and primary email on success', async () => {
    const result = await requireAuth()

    expect(result).toEqual({
      context: { user, email: 'student@example.com' },
    })
  })
})

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('admin@example.com')
    isAdminUserMock.mockReturnValue(true)
  })

  it('returns 403 for authenticated non-admin users', async () => {
    isAdminUserMock.mockReturnValue(false)

    const result = await requireAdmin()

    expect(isAdminUserMock).toHaveBeenCalledWith(user)
    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(403)
      await expect(result.response.json()).resolves.toEqual({
        error: 'Forbidden',
      })
    }
  })

  it('returns the auth context for admin users', async () => {
    const result = await requireAdmin()

    expect(result).toEqual({
      context: { user, email: 'admin@example.com' },
    })
  })
})

describe('requireStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = null
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('student@example.com')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns 503 when the admin database client is missing', async () => {
    const result = await requireStudent()

    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(503)
      await expect(result.response.json()).resolves.toEqual({
        error: 'Server database is not configured.',
      })
    }
  })

  it('returns 500 when the student lookup query fails', async () => {
    mockStudentQuery({ data: null, error: { message: 'timeout' } })

    const result = await requireStudent()

    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(500)
      await expect(result.response.json()).resolves.toEqual({
        error: 'Could not load student profile.',
      })
    }
  })

  it('returns 403 when no student profile exists for the email', async () => {
    const { from, eq } = mockStudentQuery({ data: null, error: null })

    const result = await requireStudent()

    expect(from).toHaveBeenCalledWith('students')
    expect(eq).toHaveBeenCalledWith('email', 'student@example.com')
    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(403)
      await expect(result.response.json()).resolves.toEqual({
        error: 'Student profile required.',
      })
    }
  })

  it('attaches studentId and nullable cohortId on success', async () => {
    mockStudentQuery({
      data: { id: 'student-1', cohort_id: null },
      error: null,
    })

    const result = await requireStudent()

    expect(result).toEqual({
      context: {
        user,
        email: 'student@example.com',
        studentId: 'student-1',
        cohortId: null,
      },
    })
  })
})

describe('getStudentForEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = null
  })

  it('returns null when the admin database client is missing', async () => {
    await expect(getStudentForEmail('a@example.com')).resolves.toBeNull()
  })

  it('returns the matching student row', async () => {
    const student = {
      id: 'student-1',
      name: 'Ada',
      email: 'ada@example.com',
      cohort_id: 'cohort-1',
      batch: '2026',
    }
    const { from, eq } = mockStudentQuery({ data: student, error: null })

    await expect(getStudentForEmail('ada@example.com')).resolves.toEqual(student)
    expect(from).toHaveBeenCalledWith('students')
    expect(eq).toHaveBeenCalledWith('email', 'ada@example.com')
  })
})
