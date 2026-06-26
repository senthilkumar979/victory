import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getStudentForSeo } from '@/lib/seo/getStudentForSeo'

const { adminFromMock, clientFromMock, dbState } = vi.hoisted(() => {
  const adminFromMock = vi.fn()
  const clientFromMock = vi.fn()

  return {
    adminFromMock,
    clientFromMock,
    dbState: {
      admin: { from: adminFromMock },
      client: { from: clientFromMock },
    },
  }
})

vi.mock('server-only', () => ({}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()

  return {
    ...actual,
    cache: <Arguments extends unknown[], Result>(
      callback: (...args: Arguments) => Result,
    ) => callback,
  }
})

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.admin
  },
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return dbState.client
  },
}))

interface StudentSeoQuery {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
}

function mockStudentSeoQuery(result: unknown): StudentSeoQuery {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  adminFromMock.mockReturnValue(query)
  clientFromMock.mockReturnValue(query)

  return query
}

describe('getStudentForSeo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.admin = { from: adminFromMock }
  })

  it('skips Supabase when the profile id is empty', async () => {
    await expect(getStudentForSeo('')).resolves.toBeNull()

    expect(adminFromMock).not.toHaveBeenCalled()
    expect(clientFromMock).not.toHaveBeenCalled()
  })

  it('maps a student row for metadata and normalizes optional fields', async () => {
    const query = mockStudentSeoQuery({
      data: {
        id: 'student-1',
        name: null,
        summary: undefined,
        picture: 'https://img.example.com/student.png',
        role: 'Engineer',
        company: undefined,
        batch: 'Batch 1',
      },
      error: null,
    })

    await expect(getStudentForSeo('student-1')).resolves.toEqual({
      id: 'student-1',
      name: 'Student',
      summary: null,
      picture: 'https://img.example.com/student.png',
      role: 'Engineer',
      company: null,
      batch: 'Batch 1',
    })

    expect(adminFromMock).toHaveBeenCalledWith('students')
    expect(clientFromMock).not.toHaveBeenCalled()
    expect(query.select).toHaveBeenCalledWith(
      'id, name, summary, picture, role, company, batch',
    )
    expect(query.eq).toHaveBeenCalledWith('id', 'student-1')
  })

  it('falls back to the public client when the admin client is unavailable', async () => {
    dbState.admin = null
    mockStudentSeoQuery({
      data: {
        id: 'student-2',
        name: 'Grace Hopper',
      },
      error: null,
    })

    await expect(getStudentForSeo('student-2')).resolves.toMatchObject({
      id: 'student-2',
      name: 'Grace Hopper',
    })

    expect(adminFromMock).not.toHaveBeenCalled()
    expect(clientFromMock).toHaveBeenCalledWith('students')
  })

  it('returns null when Supabase errors or has no matching row', async () => {
    mockStudentSeoQuery({ data: null, error: new Error('missing') })

    await expect(getStudentForSeo('missing-student')).resolves.toBeNull()

    mockStudentSeoQuery({ data: null, error: null })

    await expect(getStudentForSeo('empty-student')).resolves.toBeNull()
  })
})
