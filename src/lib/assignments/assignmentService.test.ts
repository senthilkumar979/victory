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

vi.mock('@/lib/assignments/assignmentUtils', () => ({
  getAssignmentDueStatus: vi.fn(() => 'upcoming'),
}))

import {
  enrichAssignmentListItem,
  getAssignmentStats,
  getSubmissionById,
  getSubmissionForStudent,
  upsertSubmission,
} from './assignmentService'

function createChain(result: {
  data?: unknown
  error?: { message: string } | null
  count?: number | null
}) {
  const chain: Record<string, unknown> = {}
  const methods = [
    'select',
    'eq',
    'order',
    'update',
    'insert',
    'maybeSingle',
    'single',
  ]
  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  chain.maybeSingle = vi.fn().mockResolvedValue({
    data: result.data ?? null,
    error: result.error ?? null,
  })
  chain.single = vi.fn().mockResolvedValue({
    data: result.data ?? null,
    error: result.error ?? null,
  })
  // count queries resolve via thenable from select+eq without single
  ;(chain as { then?: unknown }).then = undefined
  Object.assign(chain, {
    // When used as Promise.all count heads, callers await the builder itself
  })
  return chain
}

describe('assignmentService submission helpers', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
  })

  it('throws when the server database is not configured', async () => {
    await expect(getSubmissionById('submission-1')).rejects.toThrow(
      'Server database is not configured.',
    )
  })

  it('maps getSubmissionById rows including nested student and rating', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'submission-1',
        assignment_id: 'assignment-1',
        student_id: 'student-1',
        google_doc_url: 'https://docs.google.com/document/d/abc',
        github_repo_url: '',
        submitted_at: '2026-07-01T00:00:00.000Z',
        updated_at: '2026-07-02T00:00:00.000Z',
        rating: '4',
        feedback_comment: 'Solid work',
        reviewed_by: 'admin@example.com',
        reviewed_at: '2026-07-03T00:00:00.000Z',
        students: { name: 'Ada', email: 'ada@example.com' },
      },
      error: null,
    })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ select })
    supabaseAdminState.client = { from }

    const submission = await getSubmissionById('submission-1')

    expect(from).toHaveBeenCalledWith('assignment_submissions')
    expect(select).toHaveBeenCalledWith('*, students(name, email)')
    expect(eq).toHaveBeenCalledWith('id', 'submission-1')
    expect(submission).toEqual({
      id: 'submission-1',
      assignmentId: 'assignment-1',
      studentId: 'student-1',
      studentName: 'Ada',
      studentEmail: 'ada@example.com',
      googleDocUrl: 'https://docs.google.com/document/d/abc',
      githubRepoUrl: '',
      submittedAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-02T00:00:00.000Z',
      rating: 4,
      feedbackComment: 'Solid work',
      reviewedBy: 'admin@example.com',
      reviewedAt: '2026-07-03T00:00:00.000Z',
    })
  })

  it('returns null from getSubmissionForStudent when no row exists', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqStudent = vi.fn().mockReturnValue({ maybeSingle })
    const eqAssignment = vi.fn().mockReturnValue({ eq: eqStudent })
    const select = vi.fn().mockReturnValue({ eq: eqAssignment })
    const from = vi.fn().mockReturnValue({ select })
    supabaseAdminState.client = { from }

    await expect(
      getSubmissionForStudent('assignment-1', 'student-1'),
    ).resolves.toBeNull()
  })

  it('clears feedback fields when upserting an existing submission', async () => {
    const existingMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'submission-1',
        assignment_id: 'assignment-1',
        student_id: 'student-1',
        google_doc_url: 'https://docs.google.com/document/d/old',
        github_repo_url: '',
        submitted_at: '2026-07-01T00:00:00.000Z',
        updated_at: '2026-07-01T00:00:00.000Z',
        rating: 5,
        feedback_comment: 'Previous feedback',
        reviewed_by: 'admin@example.com',
        reviewed_at: '2026-07-02T00:00:00.000Z',
      },
      error: null,
    })
    const existingEqStudent = vi.fn().mockReturnValue({
      maybeSingle: existingMaybeSingle,
    })
    const existingEqAssignment = vi.fn().mockReturnValue({
      eq: existingEqStudent,
    })
    const existingSelect = vi.fn().mockReturnValue({
      eq: existingEqAssignment,
    })

    const updateSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'submission-1',
        assignment_id: 'assignment-1',
        student_id: 'student-1',
        google_doc_url: 'https://docs.google.com/document/d/new',
        github_repo_url: 'https://github.com/org/repo',
        submitted_at: '2026-07-01T00:00:00.000Z',
        updated_at: '2026-07-04T00:00:00.000Z',
        rating: null,
        feedback_comment: null,
        reviewed_by: null,
        reviewed_at: null,
      },
      error: null,
    })
    const updateSelect = vi.fn().mockReturnValue({ single: updateSingle })
    const updateEq = vi.fn().mockReturnValue({ select: updateSelect })
    const update = vi.fn().mockReturnValue({ eq: updateEq })

    const from = vi
      .fn()
      .mockReturnValueOnce({ select: existingSelect })
      .mockReturnValueOnce({ update })
    supabaseAdminState.client = { from }

    const result = await upsertSubmission({
      assignmentId: 'assignment-1',
      studentId: 'student-1',
      googleDocUrl: 'https://docs.google.com/document/d/new',
      githubRepoUrl: 'https://github.com/org/repo',
    })

    expect(update).toHaveBeenCalledWith({
      google_doc_url: 'https://docs.google.com/document/d/new',
      github_repo_url: 'https://github.com/org/repo',
      rating: null,
      feedback_comment: null,
      reviewed_by: null,
      reviewed_at: null,
    })
    expect(updateEq).toHaveBeenCalledWith('id', 'submission-1')
    expect(result).toMatchObject({
      id: 'submission-1',
      googleDocUrl: 'https://docs.google.com/document/d/new',
      githubRepoUrl: 'https://github.com/org/repo',
      rating: null,
      feedbackComment: null,
      reviewedBy: null,
      reviewedAt: null,
    })
  })

  it('inserts a new submission when none exists yet', async () => {
    const existingMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    })
    const existingEqStudent = vi.fn().mockReturnValue({
      maybeSingle: existingMaybeSingle,
    })
    const existingEqAssignment = vi.fn().mockReturnValue({
      eq: existingEqStudent,
    })
    const existingSelect = vi.fn().mockReturnValue({
      eq: existingEqAssignment,
    })

    const insertSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'submission-new',
        assignment_id: 'assignment-1',
        student_id: 'student-1',
        google_doc_url: '',
        github_repo_url: 'https://github.com/org/repo',
        submitted_at: '2026-07-05T00:00:00.000Z',
        updated_at: '2026-07-05T00:00:00.000Z',
        rating: null,
        feedback_comment: null,
        reviewed_by: null,
        reviewed_at: null,
      },
      error: null,
    })
    const insertSelect = vi.fn().mockReturnValue({ single: insertSingle })
    const insert = vi.fn().mockReturnValue({ select: insertSelect })

    const from = vi
      .fn()
      .mockReturnValueOnce({ select: existingSelect })
      .mockReturnValueOnce({ insert })
    supabaseAdminState.client = { from }

    const result = await upsertSubmission({
      assignmentId: 'assignment-1',
      studentId: 'student-1',
      googleDocUrl: '',
      githubRepoUrl: 'https://github.com/org/repo',
    })

    expect(insert).toHaveBeenCalledWith({
      assignment_id: 'assignment-1',
      student_id: 'student-1',
      google_doc_url: '',
      github_repo_url: 'https://github.com/org/repo',
    })
    expect(result.id).toBe('submission-new')
  })
})

describe('assignmentService stats and enrichment', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
  })

  it('computes submission percentage and pending counts', async () => {
    const studentsHead = Promise.resolve({
      count: 10,
      error: null,
      data: null,
    })
    const submissionsHead = Promise.resolve({
      count: 4,
      error: null,
      data: null,
    })

    const studentsSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue(studentsHead),
    })
    const submissionsSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue(submissionsHead),
    })

    const from = vi
      .fn()
      .mockImplementation((table: string) => {
        if (table === 'students') return { select: studentsSelect }
        if (table === 'assignment_submissions')
          return { select: submissionsSelect }
        throw new Error(`unexpected table ${table}`)
      })
    supabaseAdminState.client = { from }

    await expect(
      getAssignmentStats('assignment-1', 'cohort-1'),
    ).resolves.toEqual({
      totalStudents: 10,
      submittedCount: 4,
      pendingCount: 6,
      submissionPercentage: 40,
    })
  })

  it('returns zero percentage when a cohort has no students', async () => {
    const studentsHead = Promise.resolve({
      count: 0,
      error: null,
      data: null,
    })
    const submissionsHead = Promise.resolve({
      count: 0,
      error: null,
      data: null,
    })

    const from = vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(
          table === 'students' ? studentsHead : submissionsHead,
        ),
      }),
    }))
    supabaseAdminState.client = { from }

    await expect(
      getAssignmentStats('assignment-1', 'cohort-empty'),
    ).resolves.toEqual({
      totalStudents: 0,
      submittedCount: 0,
      pendingCount: 0,
      submissionPercentage: 0,
    })
  })

  it('enriches list items with stats and due status', () => {
    const enriched = enrichAssignmentListItem(
      {
        id: 'assignment-1',
        title: 'Lab',
        description: '',
        cohortId: 'cohort-1',
        category: 'Backend',
        googleGroupId: 'group-1',
        attachments: null,
        dueDate: '2099-01-01T00:00:00.000Z',
        createdBy: 'admin@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        totalStudents: 5,
        submittedCount: 2,
        pendingCount: 3,
        submissionPercentage: 40,
      },
      'submitted',
    )

    expect(enriched).toMatchObject({
      id: 'assignment-1',
      mySubmissionStatus: 'submitted',
      dueStatus: 'upcoming',
      stats: {
        totalStudents: 5,
        submittedCount: 2,
        pendingCount: 3,
        submissionPercentage: 40,
      },
    })
  })
})
