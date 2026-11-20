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
  createAssignment,
  listAssignmentsForAdmin,
  listCohorts,
  listSubmissionsForAssignment,
  updateAssignment,
} from './assignmentService'

function queryEndingAt(terminal: 'order' | 'single') {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    single: vi.fn(),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.insert.mockReturnValue(query)
  query.update.mockReturnValue(query)
  if (terminal === 'order') query.order.mockReturnValue(query)
  return query
}

describe('assignment list queries', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
  })

  it('lists cohorts by name descending and drops columns outside id and name', async () => {
    const query = queryEndingAt('order')
    query.order.mockResolvedValue({
      data: [
        { id: 'c-z', name: 'Zeta', secret: 'nope' },
        { id: 'c-a', name: 'Alpha' },
      ],
      error: null,
    })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    await expect(listCohorts()).resolves.toEqual([
      { id: 'c-z', name: 'Zeta' },
      { id: 'c-a', name: 'Alpha' },
    ])
    expect(query.select).toHaveBeenCalledWith('id, name')
    expect(query.order).toHaveBeenCalledWith('name', { ascending: false })
  })

  it('returns no cohorts when the query has no rows and rethrows database errors', async () => {
    const query = queryEndingAt('order')
    query.order.mockResolvedValue({ data: null, error: null })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    await expect(listCohorts()).resolves.toEqual([])

    query.order.mockResolvedValueOnce({
      data: null,
      error: { message: 'cohorts down' },
    })
    await expect(listCohorts()).rejects.toEqual({ message: 'cohorts down' })
  })

  it('lists every assignment newest-due first and blanks missing description, attachment, and cohort', async () => {
    const query = queryEndingAt('order')
    query.order.mockResolvedValue({
      data: [
        {
          id: 'assignment-2',
          title: 'Draft',
          description: null,
          cohort_id: 'cohort-2',
          category: 'Misc',
          google_group_id: 'group-2',
          due_date: '2026-08-01T00:00:00.000Z',
          created_by: 'admin@example.com',
          created_at: '2026-07-01T00:00:00.000Z',
          updated_at: '2026-07-02T00:00:00.000Z',
          cohorts: null,
        },
      ],
      error: null,
    })
    const from = vi.fn().mockReturnValue(query)
    supabaseAdminState.client = { from }

    await expect(listAssignmentsForAdmin()).resolves.toEqual([
      {
        id: 'assignment-2',
        title: 'Draft',
        description: '',
        cohortId: 'cohort-2',
        cohortName: undefined,
        category: 'Misc',
        googleGroupId: 'group-2',
        attachments: null,
        dueDate: '2026-08-01T00:00:00.000Z',
        createdBy: 'admin@example.com',
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-02T00:00:00.000Z',
      },
    ])
    expect(from).toHaveBeenCalledWith('assignments')
    expect(query.select).toHaveBeenCalledWith('*, cohorts(name)')
    expect(query.eq).not.toHaveBeenCalled()
    expect(query.order).toHaveBeenCalledWith('due_date', { ascending: false })
  })

  it('returns no admin assignments when data is missing and rethrows database errors', async () => {
    const query = queryEndingAt('order')
    query.order.mockResolvedValue({ data: null, error: null })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    await expect(listAssignmentsForAdmin()).resolves.toEqual([])

    query.order.mockResolvedValueOnce({
      data: null,
      error: { message: 'assignments down' },
    })
    await expect(listAssignmentsForAdmin()).rejects.toEqual({
      message: 'assignments down',
    })
  })

  it('keeps a zero rating and a null rating when listing submissions newest first', async () => {
    const query = queryEndingAt('order')
    query.order.mockResolvedValue({
      data: [
        {
          id: 'submission-0',
          assignment_id: 'assignment-1',
          student_id: 'student-1',
          google_doc_url: 'https://docs.google.com/document/d/zero',
          github_repo_url: '',
          submitted_at: '2026-07-04T00:00:00.000Z',
          updated_at: '2026-07-04T00:00:00.000Z',
          rating: 0,
          feedback_comment: null,
          reviewed_by: null,
          reviewed_at: null,
          students: null,
        },
        {
          id: 'submission-1',
          assignment_id: 'assignment-1',
          student_id: 'student-2',
          students: { name: 'Ada', email: 'ada@example.com' },
          google_doc_url: '',
          github_repo_url: 'https://github.com/org/repo',
          submitted_at: '2026-07-01T00:00:00.000Z',
          updated_at: '2026-07-01T00:00:00.000Z',
          rating: null,
          feedback_comment: 'Keep going',
          reviewed_by: 'admin@example.com',
          reviewed_at: '2026-07-02T00:00:00.000Z',
        },
      ],
      error: null,
    })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    const submissions = await listSubmissionsForAssignment('assignment-1')

    expect(query.eq).toHaveBeenCalledWith('assignment_id', 'assignment-1')
    expect(query.order).toHaveBeenCalledWith('submitted_at', {
      ascending: false,
    })
    expect(submissions[0]).toMatchObject({
      id: 'submission-0',
      rating: 0,
      studentName: undefined,
      studentEmail: undefined,
      feedbackComment: null,
    })
    expect(submissions[1]).toMatchObject({
      id: 'submission-1',
      rating: null,
      studentName: 'Ada',
      studentEmail: 'ada@example.com',
    })
  })

  it('returns no submissions when data is missing and rethrows database errors', async () => {
    const query = queryEndingAt('order')
    query.order.mockResolvedValue({ data: null, error: null })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    await expect(listSubmissionsForAssignment('assignment-1')).resolves.toEqual(
      [],
    )

    query.order.mockResolvedValueOnce({
      data: null,
      error: { message: 'submissions down' },
    })
    await expect(listSubmissionsForAssignment('assignment-1')).rejects.toEqual({
      message: 'submissions down',
    })
  })

  it('stores a real attachment URL on create and update', async () => {
    const attachment = 'https://example.com/spec.pdf'
    const createdQuery = queryEndingAt('single')
    createdQuery.single.mockResolvedValue({
      data: {
        id: 'assignment-1',
        title: 'Lab 1',
        description: 'Build the API',
        cohort_id: 'cohort-1',
        category: 'Backend',
        google_group_id: 'group-1',
        attachments: attachment,
        due_date: '2026-07-20T00:00:00.000Z',
        created_by: 'admin@example.com',
        created_at: '2026-07-01T00:00:00.000Z',
        updated_at: '2026-07-02T00:00:00.000Z',
        cohorts: { name: 'TS Batch 1' },
      },
      error: null,
    })
    supabaseAdminState.client = {
      from: vi.fn().mockReturnValue(createdQuery),
    }

    const created = await createAssignment({
      title: 'Lab 1',
      description: 'Build the API',
      cohortId: 'cohort-1',
      category: 'Backend',
      googleGroupId: 'group-1',
      attachments: attachment,
      dueDate: '2026-07-20T00:00:00.000Z',
      createdBy: 'admin@example.com',
    })

    expect(createdQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ attachments: attachment }),
    )
    expect(created.attachments).toBe(attachment)

    const updatedQuery = queryEndingAt('single')
    updatedQuery.single.mockResolvedValue({
      data: {
        id: 'assignment-1',
        title: 'Lab 1',
        description: 'Build the API',
        cohort_id: 'cohort-1',
        category: 'Backend',
        google_group_id: 'group-1',
        attachments: attachment,
        due_date: '2026-07-20T00:00:00.000Z',
        created_by: 'admin@example.com',
        created_at: '2026-07-01T00:00:00.000Z',
        updated_at: '2026-07-02T00:00:00.000Z',
        cohorts: { name: 'TS Batch 1' },
      },
      error: null,
    })
    supabaseAdminState.client = {
      from: vi.fn().mockReturnValue(updatedQuery),
    }

    await updateAssignment('assignment-1', { attachments: attachment })

    expect(updatedQuery.update).toHaveBeenCalledWith({
      attachments: attachment,
    })
    expect(updatedQuery.eq).toHaveBeenCalledWith('id', 'assignment-1')
  })
})
