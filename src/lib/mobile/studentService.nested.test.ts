import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMobileDbMock } = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/hooks/useUpdateStudent', () => ({
  toSupabasePayload: vi.fn(),
}))

vi.mock('@/lib/mapSupabaseStudentRowToProfile', () => ({
  mapSupabaseStudentRowToProfile: vi.fn(),
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
  getStudentAwards,
  getStudentRoadmapProgress,
} from './studentService'

function createOrderedQuery(result: {
  data: Record<string, unknown>[] | null
  error: { message: string } | null
}) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  return query
}

function createEqualityQuery(result: {
  data: Record<string, unknown>[] | null
  error: { message: string } | null
}) {
  const query = {
    select: vi.fn(),
    eq: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  return query
}

describe('getStudentAwards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads awards for the student ordered by newest year first', async () => {
    const awards = [
      { id: 'award-2', title: 'Recent', year: 2026 },
      { id: 'award-1', title: 'Earlier', year: 2024 },
    ]
    const query = createOrderedQuery({ data: awards, error: null })
    getMobileDbMock.mockReturnValue({
      from: vi.fn(() => query),
    })

    await expect(getStudentAwards('student-42')).resolves.toEqual(awards)

    expect(getMobileDbMock().from).toHaveBeenCalledWith('awards')
    expect(query.select).toHaveBeenCalledWith(
      'id, title, year, category_id, student_id, created_at',
    )
    expect(query.eq).toHaveBeenCalledWith('student_id', 'student-42')
    expect(query.order).toHaveBeenCalledWith('year', { ascending: false })
  })

  it('returns an empty list when the student has no awards', async () => {
    const query = createOrderedQuery({ data: null, error: null })
    getMobileDbMock.mockReturnValue({
      from: vi.fn(() => query),
    })

    await expect(getStudentAwards('student-empty')).resolves.toEqual([])
  })

  it('surfaces award query failures as mobile service errors', async () => {
    const query = createOrderedQuery({
      data: null,
      error: { message: 'awards unavailable' },
    })
    getMobileDbMock.mockReturnValue({
      from: vi.fn(() => query),
    })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(getStudentAwards('student-1')).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load student awards.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })
})

describe('getStudentRoadmapProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads roadmap completions for the requested student', async () => {
    const progress = [
      { id: 'progress-1', student_id: 'student-7', node_id: 'node-a' },
    ]
    const query = createEqualityQuery({ data: progress, error: null })
    getMobileDbMock.mockReturnValue({
      from: vi.fn(() => query),
    })

    await expect(getStudentRoadmapProgress('student-7')).resolves.toEqual(
      progress,
    )

    expect(getMobileDbMock().from).toHaveBeenCalledWith('roadmap_completions')
    expect(query.select).toHaveBeenCalledWith('*')
    expect(query.eq).toHaveBeenCalledWith('student_id', 'student-7')
  })

  it('returns an empty list when progress data is missing', async () => {
    const query = createEqualityQuery({ data: null, error: null })
    getMobileDbMock.mockReturnValue({
      from: vi.fn(() => query),
    })

    await expect(getStudentRoadmapProgress('student-empty')).resolves.toEqual([])
  })

  it('surfaces roadmap query failures as mobile service errors', async () => {
    const query = createEqualityQuery({
      data: null,
      error: { message: 'roadmap unavailable' },
    })
    getMobileDbMock.mockReturnValue({
      from: vi.fn(() => query),
    })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(getStudentRoadmapProgress('student-1')).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load roadmap progress.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })
})
