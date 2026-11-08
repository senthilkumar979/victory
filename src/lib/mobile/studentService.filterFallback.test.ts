import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMobileDbMock } = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/hooks/useUpdateStudent', () => ({
  toSupabasePayload: vi.fn(),
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
}))

import { getStudentFilterOptions } from './studentService'

describe('getStudentFilterOptions directory fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('still returns cohorts when the student directory query fails', async () => {
    const cohorts = [
      { id: 'c1', name: 'Alpha' },
      { id: 'c2', name: 'Beta' },
    ]
    const cohortsQuery = {
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: cohorts, error: null }),
      }),
    }
    const studentsQuery = {
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'students down', code: '57014' },
      }),
    }
    getMobileDbMock.mockReturnValue({
      from: vi.fn((table: string) =>
        table === 'cohorts' ? cohortsQuery : studentsQuery,
      ),
    })

    await expect(getStudentFilterOptions()).resolves.toEqual({
      cohorts,
      companies: [],
      roles: [],
    })
    expect(studentsQuery.select).toHaveBeenCalledWith('company, role')
  })
})
