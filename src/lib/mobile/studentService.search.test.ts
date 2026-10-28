import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMobileDbMock } = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/hooks/useUpdateStudent', () => ({
  toSupabasePayload: vi.fn(),
}))

vi.mock('@/lib/mapSupabaseStudentRowToProfile', () => ({
  mapSupabaseStudentRowToProfile: (row: { id: string }) => ({ profileId: row.id }),
}))

vi.mock('@/lib/mobile/mobileApiUtils', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/lib/mobile/mobileApiUtils')>()

  return { ...original, getMobileDb: getMobileDbMock }
})

import { listStudents } from '@/lib/mobile/studentService'

function createStudentDb(cohort: { id: string; name: string } | null = null) {
  const studentQuery = {
    select: vi.fn(),
    order: vi.fn(),
    ilike: vi.fn(),
    or: vi.fn(),
    eq: vi.fn(),
    range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
  }
  for (const method of ['select', 'order', 'ilike', 'or', 'eq'] as const) {
    studentQuery[method].mockReturnValue(studentQuery)
  }

  const cohortQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: cohort, error: null }),
  }
  cohortQuery.select.mockReturnValue(cohortQuery)
  cohortQuery.eq.mockReturnValue(cohortQuery)

  return { studentQuery, cohortQuery }
}

describe('listStudents search and cohort guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not apply a name filter for whitespace-only search', async () => {
    const { studentQuery } = createStudentDb()
    getMobileDbMock.mockReturnValue({
      from: vi.fn(() => studentQuery),
    })

    await listStudents({ search: '   ' })

    expect(studentQuery.ilike).not.toHaveBeenCalled()
  })

  it('filters by cohort id when the cohort row has no name', async () => {
    const { studentQuery, cohortQuery } = createStudentDb({
      id: 'cohort-1',
      name: '',
    })
    getMobileDbMock.mockReturnValue({
      from: vi.fn((table: string) =>
        table === 'cohorts' ? cohortQuery : studentQuery,
      ),
    })

    await listStudents({ cohort: 'cohort-1' })

    expect(cohortQuery.eq).toHaveBeenCalledWith('id', 'cohort-1')
    expect(studentQuery.eq).toHaveBeenCalledWith('cohort_id', 'cohort-1')
    expect(studentQuery.or).not.toHaveBeenCalled()
  })
})
