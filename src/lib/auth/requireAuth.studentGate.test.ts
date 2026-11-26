import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCurrentUserMock, getPrimaryEmailMock, isAdminUserMock, dbState } =
  vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    getPrimaryEmailMock: vi.fn(),
    isAdminUserMock: vi.fn(),
    dbState: { client: null as unknown },
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
  requireStudent,
} from './requireAuth'

const user = { id: 'user-1' }

function studentQuery(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  const from = vi.fn(() => query)
  dbState.client = { from }
  return { from, query }
}

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = null
  })

  it('returns 401 without checking admin when there is no user', async () => {
    getCurrentUserMock.mockResolvedValue(null)

    const result = await requireAdmin()

    expect(result).toEqual({
      response: expect.objectContaining({ status: 401 }),
    })
    if (!('response' in result)) return
    await expect(result.response.json()).resolves.toEqual({
      error: 'Unauthorized',
    })
    expect(isAdminUserMock).not.toHaveBeenCalled()
  })

  it('returns 403 without checking admin when the account has no email', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue(null)

    const result = await requireAdmin()

    expect('response' in result).toBe(true)
    if (!('response' in result)) return
    expect(result.response.status).toBe(403)
    await expect(result.response.json()).resolves.toEqual({
      error: 'No email on account',
    })
    expect(isAdminUserMock).not.toHaveBeenCalled()
  })
})

describe('requireStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = null
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('returns 401 before the unconfigured-database response', async () => {
    getCurrentUserMock.mockResolvedValue(null)

    const result = await requireStudent()

    expect('response' in result).toBe(true)
    if (!('response' in result)) return
    expect(result.response.status).toBe(401)
    await expect(result.response.json()).resolves.toEqual({
      error: 'Unauthorized',
    })
  })

  it('returns 403 and does not query when the account has no email', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue(null)
    const { from } = studentQuery({ data: null, error: null })

    const result = await requireStudent()

    expect('response' in result).toBe(true)
    if (!('response' in result)) return
    expect(result.response.status).toBe(403)
    await expect(result.response.json()).resolves.toEqual({
      error: 'No email on account',
    })
    expect(from).not.toHaveBeenCalled()
  })

  it('returns 503 when the database client is missing', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('student@example.com')

    const result = await requireStudent()

    expect('response' in result).toBe(true)
    if (!('response' in result)) return
    expect(result.response.status).toBe(503)
    await expect(result.response.json()).resolves.toEqual({
      error: 'Server database is not configured.',
    })
  })

  it('rejects a blank student id', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('student@example.com')
    studentQuery({ data: { id: '', cohort_id: 'cohort-1' }, error: null })

    const result = await requireStudent()

    expect('response' in result).toBe(true)
    if (!('response' in result)) return
    expect(result.response.status).toBe(403)
    await expect(result.response.json()).resolves.toEqual({
      error: 'Student profile required.',
    })
  })

  it('hides the database error behind a generic profile message', async () => {
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('student@example.com')
    studentQuery({ data: null, error: { message: 'password authentication failed' } })

    const result = await requireStudent()

    expect('response' in result).toBe(true)
    if (!('response' in result)) return
    expect(result.response.status).toBe(500)
    const body = await result.response.json()
    expect(body).toEqual({ error: 'Could not load student profile.' })
    expect(JSON.stringify(body)).not.toContain('password')
  })
})

describe('getStudentForEmail', () => {
  beforeEach(() => {
    dbState.client = null
  })

  it('returns null when the lookup errors instead of throwing', async () => {
    studentQuery({ data: null, error: { message: 'timeout' } })

    await expect(getStudentForEmail('ada@example.com')).resolves.toBeNull()
  })

  it('returns null when the database client is missing', async () => {
    await expect(getStudentForEmail('ada@example.com')).resolves.toBeNull()
  })
})
