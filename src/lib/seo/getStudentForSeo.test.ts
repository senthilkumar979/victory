import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    cache: (fn: unknown) => fn,
  }
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
  fromMock.mockReturnValue(query)
  return query
}

describe('getStudentForSeo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips Supabase for a missing student id', async () => {
    await expect(getStudentForSeo('')).resolves.toBeNull()

    expect(fromMock).not.toHaveBeenCalled()
  })

  it('maps the selected student fields for SEO metadata', async () => {
    const query = mockStudentSeoQuery({
      data: {
        id: 'student-1',
        name: 'Ada Lovelace',
        summary: 'Builds reliable software.',
        picture: 'https://img.example.test/ada.png',
        role: 'Engineer',
        company: 'Analytical Engines',
        batch: '2026',
      },
      error: null,
    })

    await expect(getStudentForSeo('student-1')).resolves.toEqual({
      id: 'student-1',
      name: 'Ada Lovelace',
      summary: 'Builds reliable software.',
      picture: 'https://img.example.test/ada.png',
      role: 'Engineer',
      company: 'Analytical Engines',
      batch: '2026',
    })

    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith(
      'id, name, summary, picture, role, company, batch',
    )
    expect(query.eq).toHaveBeenCalledWith('id', 'student-1')
    expect(query.maybeSingle).toHaveBeenCalledTimes(1)
  })

  it('returns null when Supabase cannot find the student', async () => {
    mockStudentSeoQuery({ data: null, error: null })

    await expect(getStudentForSeo('missing-student')).resolves.toBeNull()
  })
})
