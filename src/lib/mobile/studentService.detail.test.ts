import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getMobileDbMock,
  mapSupabaseStudentRowToProfileMock,
  toSupabasePayloadMock,
  getStudentSelectColumnsMock,
} = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
  mapSupabaseStudentRowToProfileMock: vi.fn(),
  toSupabasePayloadMock: vi.fn(),
  getStudentSelectColumnsMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/hooks/useUpdateStudent', () => ({
  toSupabasePayload: toSupabasePayloadMock,
}))

vi.mock('@/lib/mapSupabaseStudentRowToProfile', () => ({
  mapSupabaseStudentRowToProfile: mapSupabaseStudentRowToProfileMock,
}))

vi.mock('@/lib/studentSelectColumns', () => ({
  getStudentSelectColumns: getStudentSelectColumnsMock,
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
  paginationMeta: vi.fn(),
}))

import {
  getStudentById,
  getStudentFilterOptions,
  updateStudent,
} from './studentService'

const studentRow = {
  id: 'student-1',
  name: 'Grace Hopper',
  email: 'grace@example.com',
  role: 'Engineer',
  company: 'US Navy',
  cohort_id: 'cohort-1',
}

const mappedStudent = {
  id: 'student-1',
  name: 'Grace Hopper',
  email: 'grace@example.com',
  role: 'Engineer',
  company: 'US Navy',
  cohortId: 'cohort-1',
}

function createGetStudentQuery(result: {
  data: Record<string, unknown> | null
  error: { message: string } | null
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  return { from, select, eq, maybeSingle }
}

function createUpdateStudentQuery(result: {
  data: Record<string, unknown> | null
  error: { message: string } | null
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const select = vi.fn().mockReturnValue({ maybeSingle })
  const eq = vi.fn().mockReturnValue({ select })
  const update = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ update })
  return { from, update, eq, select, maybeSingle }
}

describe('getStudentById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getStudentSelectColumnsMock.mockReturnValue('id,name,email')
    mapSupabaseStudentRowToProfileMock.mockReturnValue(mappedStudent)
  })

  it('loads admin select columns and maps the student profile', async () => {
    const { from, select, eq } = createGetStudentQuery({
      data: studentRow,
      error: null,
    })
    getMobileDbMock.mockReturnValue({ from })

    await expect(getStudentById('student-1')).resolves.toEqual(mappedStudent)

    expect(getStudentSelectColumnsMock).toHaveBeenCalledWith(true)
    expect(from).toHaveBeenCalledWith('students')
    expect(select).toHaveBeenCalledWith('id,name,email')
    expect(eq).toHaveBeenCalledWith('id', 'student-1')
    expect(mapSupabaseStudentRowToProfileMock).toHaveBeenCalledWith(studentRow)
  })

  it('returns NOT_FOUND when no student row exists', async () => {
    const { from } = createGetStudentQuery({ data: null, error: null })
    getMobileDbMock.mockReturnValue({ from })

    await expect(getStudentById('missing')).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Student not found',
      status: 404,
      code: 'NOT_FOUND',
    })
  })

  it('surfaces database failures as mobile service errors', async () => {
    const { from } = createGetStudentQuery({
      data: null,
      error: { message: 'timeout' },
    })
    getMobileDbMock.mockReturnValue({ from })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(getStudentById('student-1')).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load student.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })
})

describe('updateStudent', () => {
  const payload = {
    name: 'Grace Hopper',
    email: 'grace@example.com',
    role: 'Engineer',
    cohortId: 'cohort-1',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    getStudentSelectColumnsMock.mockReturnValue('id,name,email')
    toSupabasePayloadMock.mockReturnValue({
      name: 'Grace Hopper',
      email: 'grace@example.com',
    })
    mapSupabaseStudentRowToProfileMock.mockReturnValue(mappedStudent)
  })

  it('trims the id onto the payload, updates, and returns the mapped row', async () => {
    const { from, update, eq } = createUpdateStudentQuery({
      data: studentRow,
      error: null,
    })
    getMobileDbMock.mockReturnValue({ from })

    const mutablePayload = { ...payload }
    await expect(updateStudent('  student-1  ', mutablePayload)).resolves.toEqual(
      mappedStudent,
    )

    expect(mutablePayload.id).toBe('student-1')
    expect(toSupabasePayloadMock).toHaveBeenCalledWith(mutablePayload)
    expect(update).toHaveBeenCalledWith({
      name: 'Grace Hopper',
      email: 'grace@example.com',
    })
    expect(eq).toHaveBeenCalledWith('id', '  student-1  ')
  })

  it('returns NOT_FOUND when the update matches no row', async () => {
    const { from } = createUpdateStudentQuery({ data: null, error: null })
    getMobileDbMock.mockReturnValue({ from })

    await expect(updateStudent('missing', { ...payload })).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Student not found',
      status: 404,
      code: 'NOT_FOUND',
    })
  })

  it('surfaces update failures as mobile service errors', async () => {
    const { from } = createUpdateStudentQuery({
      data: null,
      error: { message: 'constraint' },
    })
    getMobileDbMock.mockReturnValue({ from })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(updateStudent('student-1', { ...payload })).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not update student.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })
})

describe('getStudentFilterOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns sorted unique companies and roles with cohort options', async () => {
    const cohortsQuery = {
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 'c2', name: 'Beta' },
            { id: 'c1', name: 'Alpha' },
          ],
          error: null,
        }),
      }),
    }
    const studentsQuery = {
      select: vi.fn().mockResolvedValue({
        data: [
          { company: 'Acme', role: 'Engineer' },
          { company: 'Acme', role: 'Designer' },
          { company: null, role: 'Engineer' },
          { company: 'Zephyr', role: '' },
        ],
        error: null,
      }),
    }
    const from = vi.fn((table: string) =>
      table === 'cohorts' ? cohortsQuery : studentsQuery,
    )
    getMobileDbMock.mockReturnValue({ from })

    await expect(getStudentFilterOptions()).resolves.toEqual({
      cohorts: [
        { id: 'c2', name: 'Beta' },
        { id: 'c1', name: 'Alpha' },
      ],
      companies: ['Acme', 'Zephyr'],
      roles: ['Designer', 'Engineer'],
    })

    expect(from).toHaveBeenCalledWith('cohorts')
    expect(from).toHaveBeenCalledWith('students')
    expect(cohortsQuery.select).toHaveBeenCalledWith('id, name')
    expect(studentsQuery.select).toHaveBeenCalledWith('company, role')
  })

  it('fails closed when cohort options cannot be loaded', async () => {
    const cohortsQuery = {
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'cohorts down' },
        }),
      }),
    }
    const studentsQuery = {
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    getMobileDbMock.mockReturnValue({
      from: vi.fn((table: string) =>
        table === 'cohorts' ? cohortsQuery : studentsQuery,
      ),
    })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(getStudentFilterOptions()).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load filter options.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })
})
