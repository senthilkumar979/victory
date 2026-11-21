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

import type { Assignment } from '@/types/assignment.types'
import {
  getAssignmentById,
  getSubmissionForStudent,
  listAssignmentsForStudent,
} from './assignmentService'

const DUE_AT_72_HOURS = '2026-06-13T12:00:00.000Z'

function assignment(dueDate: string): Assignment {
  return {
    id: 'assignment-1',
    title: 'Lab',
    description: 'Build the API',
    cohortId: 'cohort-9',
    category: 'Backend',
    googleGroupId: 'group-1',
    attachments: null,
    dueDate,
    createdBy: 'admin@example.com',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  }
}

function queryEndingAt(terminal: 'order' | 'maybeSingle') {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  if (terminal === 'order') query.order.mockReturnValue(query)
  return query
}

describe('student assignment scope', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
  })

  it('lists only that cohort, newest due date first', async () => {
    const query = queryEndingAt('order')
    query.order.mockResolvedValue({
      data: [
        {
          id: 'assignment-1',
          title: 'Lab',
          description: 'Build the API',
          cohort_id: 'cohort-9',
          category: 'Backend',
          google_group_id: 'group-1',
          attachments: null,
          due_date: DUE_AT_72_HOURS,
          created_by: 'admin@example.com',
          created_at: '2026-06-01T00:00:00.000Z',
          updated_at: '2026-06-01T00:00:00.000Z',
          cohorts: { name: 'TS Batch 9' },
          secret: 'nope',
        },
      ],
      error: null,
    })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    await expect(listAssignmentsForStudent('cohort-9')).resolves.toEqual([
      {
        ...assignment(DUE_AT_72_HOURS),
        cohortName: 'TS Batch 9',
      },
    ])
    expect(query.eq).toHaveBeenCalledWith('cohort_id', 'cohort-9')
    expect(query.order).toHaveBeenCalledWith('due_date', { ascending: false })
    expect(query.select).toHaveBeenCalledWith('*, cohorts(name)')
  })

  it('returns no rows when data is missing and rethrows a list failure', async () => {
    const query = queryEndingAt('order')
    query.order.mockResolvedValue({ data: null, error: null })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    await expect(listAssignmentsForStudent('cohort-9')).resolves.toEqual([])

    query.order.mockResolvedValueOnce({
      data: null,
      error: { message: 'student assignments down' },
    })
    await expect(listAssignmentsForStudent('cohort-9')).rejects.toEqual({
      message: 'student assignments down',
    })
  })

  it('returns null for a missing assignment and rethrows a lookup failure', async () => {
    const query = queryEndingAt('maybeSingle')
    query.maybeSingle.mockResolvedValue({ data: null, error: null })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    await expect(getAssignmentById('assignment-1')).resolves.toBeNull()
    expect(query.eq).toHaveBeenCalledWith('id', 'assignment-1')

    const lookupError = { message: 'assignment down' }
    query.maybeSingle.mockResolvedValueOnce({ data: null, error: lookupError })
    await expect(getAssignmentById('assignment-1')).rejects.toBe(lookupError)
  })

  it('loads one student submission by assignment and student, or nothing', async () => {
    const query = queryEndingAt('maybeSingle')
    query.maybeSingle.mockResolvedValue({ data: null, error: null })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    await expect(
      getSubmissionForStudent('assignment-1', 'student-1'),
    ).resolves.toBeNull()
    expect(query.eq).toHaveBeenNthCalledWith(1, 'assignment_id', 'assignment-1')
    expect(query.eq).toHaveBeenNthCalledWith(2, 'student_id', 'student-1')

    const lookupError = { message: 'submission down' }
    query.maybeSingle.mockResolvedValueOnce({ data: null, error: lookupError })
    await expect(
      getSubmissionForStudent('assignment-1', 'student-1'),
    ).rejects.toBe(lookupError)
  })
})
