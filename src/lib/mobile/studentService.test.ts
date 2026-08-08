import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listStudents } from './studentService'

const { getMobileDbMock, mapStudentMock, paginationMetaMock } = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
  mapStudentMock: vi.fn(),
  paginationMetaMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/hooks/useUpdateStudent', () => ({
  toSupabasePayload: vi.fn(),
}))

vi.mock('@/lib/mapSupabaseStudentRowToProfile', () => ({
  mapSupabaseStudentRowToProfile: mapStudentMock,
}))

vi.mock('@/lib/mobile/mobileApiUtils', () => ({
  getMobileDb: getMobileDbMock,
  MobileServiceError: class MobileServiceError extends Error {
    constructor(
      message: string,
      public status: number,
      public code: string,
    ) {
      super(message)
      this.name = 'MobileServiceError'
    }
  },
  paginationMeta: paginationMetaMock,
}))

interface StudentQueryResult {
  data: Record<string, unknown>[] | null
  error: { message: string } | null
  count: number | null
}

function createStudentDb(
  studentResult: StudentQueryResult,
  cohort: { id: string; name: string } | null = null,
) {
  const studentQuery = {
    select: vi.fn(),
    order: vi.fn(),
    ilike: vi.fn(),
    or: vi.fn(),
    eq: vi.fn(),
    range: vi.fn().mockResolvedValue(studentResult),
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

  return {
    db: {
      from: vi.fn((table: string) =>
        table === 'cohorts' ? cohortQuery : studentQuery,
      ),
    },
    cohortQuery,
    studentQuery,
  }
}

describe('listStudents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mapStudentMock.mockImplementation((row) => ({ profileId: row.id }))
    paginationMetaMock.mockReturnValue({ page: 2, limit: 10 })
  })

  it('combines cohort compatibility, text filters, and pagination', async () => {
    const row = { id: 'student-1', name: 'Ada' }
    const { db, cohortQuery, studentQuery } = createStudentDb(
      { data: [row], error: null, count: 23 },
      { id: 'cohort-1', name: '2026' },
    )
    getMobileDbMock.mockReturnValue(db)

    const result = await listStudents({
      search: '  Ada  ',
      cohort: 'cohort-1',
      company: 'Acme',
      role: 'Engineer',
      page: 2,
      limit: 10,
    })

    expect(cohortQuery.eq).toHaveBeenCalledWith('id', 'cohort-1')
    expect(studentQuery.ilike).toHaveBeenCalledWith('name', '%Ada%')
    expect(studentQuery.or).toHaveBeenCalledWith(
      'cohort_id.eq.cohort-1,batch.eq.2026',
    )
    expect(studentQuery.eq).toHaveBeenCalledWith('company', 'Acme')
    expect(studentQuery.eq).toHaveBeenCalledWith('role', 'Engineer')
    expect(studentQuery.range).toHaveBeenCalledWith(10, 19)
    expect(mapStudentMock).toHaveBeenCalledWith(row)
    expect(paginationMetaMock).toHaveBeenCalledWith(2, 10, 23)
    expect(result).toEqual({
      data: [{ profileId: 'student-1' }],
      pagination: { page: 2, limit: 10 },
    })
  })

  it('falls back to filtering by cohort id when legacy batch data is unavailable', async () => {
    const { db, studentQuery } = createStudentDb({
      data: [],
      error: null,
      count: 0,
    })
    getMobileDbMock.mockReturnValue(db)

    await listStudents({ cohort: 'missing-cohort' })

    expect(studentQuery.eq).toHaveBeenCalledWith('cohort_id', 'missing-cohort')
    expect(studentQuery.or).not.toHaveBeenCalled()
  })

  it('surfaces database failures as mobile service errors', async () => {
    const databaseError = { message: 'database unavailable' }
    const { db } = createStudentDb({
      data: null,
      error: databaseError,
      count: null,
    })
    getMobileDbMock.mockReturnValue(db)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(listStudents()).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load students.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })
})
