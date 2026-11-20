import { beforeEach, describe, expect, it, vi } from 'vitest'

const { supabaseAdminState } = vi.hoisted(() => ({
  supabaseAdminState: { client: null as unknown },
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return supabaseAdminState.client
  },
}))

import {
  getSubmissionById,
  getSubmissionForStudent,
  listAssignmentsForStudent,
} from './assignmentService'

describe('student assignment access queries', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
  })

  it('returns no cohort assignments when the query has no rows and rethrows database errors', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    supabaseAdminState.client = {
      from: vi.fn().mockReturnValue({ select }),
    }

    await expect(listAssignmentsForStudent('cohort-1')).resolves.toEqual([])
    expect(eq).toHaveBeenCalledWith('cohort_id', 'cohort-1')
    expect(order).toHaveBeenCalledWith('due_date', { ascending: false })

    const failure = { message: 'student assignments down' }
    order.mockResolvedValueOnce({ data: null, error: failure })
    await expect(listAssignmentsForStudent('cohort-1')).rejects.toBe(failure)
  })

  it('returns null for a missing submission and rethrows lookup errors', async () => {
    const failure = { message: 'submission lookup down' }
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: failure })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    supabaseAdminState.client = {
      from: vi.fn().mockReturnValue({ select }),
    }

    await expect(getSubmissionById('missing')).resolves.toBeNull()
    expect(select).toHaveBeenCalledWith('*, students(name, email)')
    expect(eq).toHaveBeenCalledWith('id', 'missing')
    await expect(getSubmissionById('missing')).rejects.toBe(failure)
  })

  it('rethrows a student submission lookup error instead of treating it as no submission', async () => {
    const failure = { message: 'student submission down' }
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: failure,
    })
    const eqStudent = vi.fn().mockReturnValue({ maybeSingle })
    const eqAssignment = vi.fn().mockReturnValue({ eq: eqStudent })
    const select = vi.fn().mockReturnValue({ eq: eqAssignment })
    supabaseAdminState.client = {
      from: vi.fn().mockReturnValue({ select }),
    }

    await expect(
      getSubmissionForStudent('assignment-1', 'student-1'),
    ).rejects.toBe(failure)
    expect(eqAssignment).toHaveBeenCalledWith('assignment_id', 'assignment-1')
    expect(eqStudent).toHaveBeenCalledWith('student_id', 'student-1')
  })
})
