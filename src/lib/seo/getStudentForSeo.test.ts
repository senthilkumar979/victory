import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return { ...actual, cache: <T extends (...args: never[]) => unknown>(fn: T) => fn }
})
vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: null,
}))
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

import { getStudentForSeo } from './getStudentForSeo'

interface StudentQueryResult {
  data: unknown
  error: Error | null
}

function mockStudentQuery(result: StudentQueryResult) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }

  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  fromMock.mockReturnValue(query)

  return query
}

describe('getStudentForSeo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null without querying when the id is empty', async () => {
    await expect(getStudentForSeo('')).resolves.toBeNull()

    expect(fromMock).not.toHaveBeenCalled()
  })

  it('returns null when Supabase returns an error or no row', async () => {
    mockStudentQuery({ data: null, error: new Error('permission denied') })

    await expect(getStudentForSeo('student-1')).resolves.toBeNull()
  })

  it('maps nullable student SEO fields with safe defaults', async () => {
    const query = mockStudentQuery({
      data: {
        id: 'student-2',
        name: null,
        summary: null,
        picture: 'https://cdn.example.com/student.png',
        role: 'Engineer',
        company: null,
        batch: 'B3',
      },
      error: null,
    })

    await expect(getStudentForSeo('student-2')).resolves.toEqual({
      id: 'student-2',
      name: 'Student',
      summary: null,
      picture: 'https://cdn.example.com/student.png',
      role: 'Engineer',
      company: null,
      batch: 'B3',
    })
    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith(
      'id, name, summary, picture, role, company, batch',
    )
    expect(query.eq).toHaveBeenCalledWith('id', 'student-2')
  })
})
