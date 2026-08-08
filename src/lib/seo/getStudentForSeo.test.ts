import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getStudentForSeo } from './getStudentForSeo'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: null,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
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
  fromMock.mockReturnValue(query)
  return query
}

describe('getStudentForSeo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not query Supabase when the id is empty', async () => {
    await expect(getStudentForSeo('')).resolves.toBeNull()
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('returns null when Supabase returns an error or no row', async () => {
    mockStudentSeoQuery({ data: null, error: new Error('not found') })

    await expect(getStudentForSeo('missing-student')).resolves.toBeNull()
  })

  it('maps nullable student fields for SEO metadata', async () => {
    const query = mockStudentSeoQuery({
      data: {
        id: 'student-1',
        name: null,
        summary: 'Builds useful products',
        picture: null,
        role: 'Developer',
        company: null,
        batch: '2026',
      },
      error: null,
    })

    await expect(getStudentForSeo('student-1')).resolves.toEqual({
      id: 'student-1',
      name: 'Student',
      summary: 'Builds useful products',
      picture: null,
      role: 'Developer',
      company: null,
      batch: '2026',
    })
    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.eq).toHaveBeenCalledWith('id', 'student-1')
  })
})
