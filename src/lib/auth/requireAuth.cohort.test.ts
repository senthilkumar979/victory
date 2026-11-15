import { beforeEach, describe, expect, it, vi } from 'vitest'

const { dbState, getCurrentUserMock, getPrimaryEmailMock } = vi.hoisted(() => ({
  dbState: { client: null as unknown },
  getCurrentUserMock: vi.fn(),
  getPrimaryEmailMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/clerkUser', () => ({
  getCurrentUser: getCurrentUserMock,
  getPrimaryEmail: getPrimaryEmailMock,
  isAdminUser: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import { requireStudent } from './requireAuth'

const user = { id: 'user-1' }

describe('requireStudent cohort id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentUserMock.mockResolvedValue(user)
    getPrimaryEmailMock.mockReturnValue('student@example.com')
  })

  it('keeps the student cohort id from the profile row', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: 'student-1', cohort_id: 'cohort-9' },
      error: null,
    })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    dbState.client = { from: vi.fn().mockReturnValue({ select }) }

    const result = await requireStudent()

    expect(select).toHaveBeenCalledWith('id, cohort_id')
    expect(eq).toHaveBeenCalledWith('email', 'student@example.com')
    expect(result).toEqual({
      context: {
        user,
        email: 'student@example.com',
        studentId: 'student-1',
        cohortId: 'cohort-9',
      },
    })
  })
})
