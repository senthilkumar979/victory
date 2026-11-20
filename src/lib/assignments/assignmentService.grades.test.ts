import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
  getAssignmentStats,
  updateSubmissionFeedback,
  upsertSubmission,
} from './assignmentService'

const reviewedAt = '2026-08-01T12:00:00.000Z'

function countQuery(count: number | null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn().mockResolvedValue({ count, error: null }),
  }
  query.select.mockReturnValue(query)
  return query
}

function submissionQuery() {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    single: vi.fn(),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.update.mockReturnValue(query)
  query.insert.mockReturnValue(query)
  return query
}

function submissionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'submission-1',
    assignment_id: 'assignment-1',
    student_id: 'student-1',
    google_doc_url: 'https://docs.google.com/document/d/abc',
    github_repo_url: 'https://github.com/org/repo',
    submitted_at: '2026-07-01T00:00:00.000Z',
    updated_at: '2026-07-02T00:00:00.000Z',
    rating: 5,
    feedback_comment: 'Great',
    reviewed_by: 'admin@example.com',
    reviewed_at: '2026-07-03T00:00:00.000Z',
    students: null,
    ...overrides,
  }
}

describe('getAssignmentStats', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
  })

  it('rounds a partial cohort and queries the roster and submissions separately', async () => {
    const students = countQuery(3)
    const submissions = countQuery(1)
    supabaseAdminState.client = {
      from: vi.fn((table: string) =>
        table === 'students' ? students : submissions,
      ),
    }

    await expect(getAssignmentStats('assignment-1', 'cohort-1')).resolves.toEqual(
      {
        totalStudents: 3,
        submittedCount: 1,
        pendingCount: 2,
        submissionPercentage: 33,
      },
    )
    expect(students.select).toHaveBeenCalledWith('id', {
      count: 'exact',
      head: true,
    })
    expect(students.eq).toHaveBeenCalledWith('cohort_id', 'cohort-1')
    expect(submissions.eq).toHaveBeenCalledWith('assignment_id', 'assignment-1')
  })

  it('does not show a negative pending count when submissions exceed the roster', async () => {
    supabaseAdminState.client = {
      from: vi.fn((table: string) =>
        table === 'students' ? countQuery(5) : countQuery(8),
      ),
    }

    await expect(getAssignmentStats('assignment-1', 'cohort-1')).resolves.toEqual(
      {
        totalStudents: 5,
        submittedCount: 8,
        pendingCount: 0,
        submissionPercentage: 160,
      },
    )
  })

  it('treats a missing roster count as zero even when submissions exist', async () => {
    supabaseAdminState.client = {
      from: vi.fn((table: string) =>
        table === 'students' ? countQuery(null) : countQuery(3),
      ),
    }

    await expect(getAssignmentStats('assignment-1', 'cohort-1')).resolves.toEqual(
      {
        totalStudents: 0,
        submittedCount: 3,
        pendingCount: 0,
        submissionPercentage: 0,
      },
    )
  })

  it('fails before querying when the admin database is not configured', async () => {
    await expect(getAssignmentStats('assignment-1', 'cohort-1')).rejects.toThrow(
      'Server database is not configured.',
    )
  })
})

describe('upsertSubmission', () => {
  const urls = {
    assignmentId: 'assignment-1',
    studentId: 'student-1',
    googleDocUrl: 'https://docs.google.com/document/d/new',
    githubRepoUrl: 'https://github.com/org/new',
  }

  beforeEach(() => {
    supabaseAdminState.client = null
  })

  it('clears the previous grade when a student replaces a reviewed submission', async () => {
    const lookup = submissionQuery()
    lookup.maybeSingle.mockResolvedValue({
      data: submissionRow(),
      error: null,
    })
    const write = submissionQuery()
    write.single.mockResolvedValue({
      data: submissionRow({
        rating: null,
        feedback_comment: null,
        reviewed_by: null,
        reviewed_at: null,
        google_doc_url: urls.googleDocUrl,
        github_repo_url: urls.githubRepoUrl,
      }),
      error: null,
    })
    const queries = [lookup, write]
    supabaseAdminState.client = {
      from: vi.fn(() => queries.shift() ?? write),
    }

    const saved = await upsertSubmission(urls)

    expect(lookup.eq).toHaveBeenNthCalledWith(1, 'assignment_id', 'assignment-1')
    expect(lookup.eq).toHaveBeenNthCalledWith(2, 'student_id', 'student-1')
    expect(write.update).toHaveBeenCalledWith({
      google_doc_url: urls.googleDocUrl,
      github_repo_url: urls.githubRepoUrl,
      rating: null,
      feedback_comment: null,
      reviewed_by: null,
      reviewed_at: null,
    })
    expect(write.eq).toHaveBeenCalledWith('id', 'submission-1')
    expect(write.insert).not.toHaveBeenCalled()
    expect(saved).toMatchObject({
      rating: null,
      feedbackComment: null,
      reviewedBy: null,
      reviewedAt: null,
    })
  })

  it('inserts a first submission without carrying over review fields', async () => {
    const lookup = submissionQuery()
    lookup.maybeSingle.mockResolvedValue({ data: null, error: null })
    const write = submissionQuery()
    write.single.mockResolvedValue({
      data: submissionRow({
        rating: null,
        feedback_comment: null,
        reviewed_by: null,
        reviewed_at: null,
      }),
      error: null,
    })
    const queries = [lookup, write]
    supabaseAdminState.client = {
      from: vi.fn(() => queries.shift() ?? write),
    }

    await upsertSubmission(urls)

    expect(write.insert).toHaveBeenCalledWith({
      assignment_id: 'assignment-1',
      student_id: 'student-1',
      google_doc_url: urls.googleDocUrl,
      github_repo_url: urls.githubRepoUrl,
    })
    expect(write.update).not.toHaveBeenCalled()
  })

  it('rethrows a lookup failure and does not insert or update', async () => {
    const lookup = submissionQuery()
    lookup.maybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'student submission down' },
    })
    const from = vi.fn().mockReturnValue(lookup)
    supabaseAdminState.client = { from }

    await expect(upsertSubmission(urls)).rejects.toEqual({
      message: 'student submission down',
    })
    expect(from).toHaveBeenCalledTimes(1)
    expect(lookup.update).not.toHaveBeenCalled()
    expect(lookup.insert).not.toHaveBeenCalled()
  })
})

describe('updateSubmissionFeedback', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(reviewedAt))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stores a trimmed comment and the review instant', async () => {
    const query = submissionQuery()
    query.single.mockResolvedValue({
      data: submissionRow({
        rating: 4.5,
        feedback_comment: 'Needs work',
        reviewed_by: 'Ada Admin',
        reviewed_at: reviewedAt,
        students: { name: 'Ada', email: 'ada@example.com' },
      }),
      error: null,
    })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    const saved = await updateSubmissionFeedback('submission-1', {
      rating: 4.5,
      reviewedBy: 'Ada Admin',
      feedbackComment: '  Needs work  ',
    })

    expect(query.update).toHaveBeenCalledWith({
      rating: 4.5,
      reviewed_by: 'Ada Admin',
      feedback_comment: 'Needs work',
      reviewed_at: reviewedAt,
    })
    expect(query.eq).toHaveBeenCalledWith('id', 'submission-1')
    expect(saved).toMatchObject({
      rating: 4.5,
      feedbackComment: 'Needs work',
      reviewedBy: 'Ada Admin',
      reviewedAt,
      studentName: 'Ada',
      studentEmail: 'ada@example.com',
    })
  })

  it('clears a blank comment and rethrows the database error unchanged', async () => {
    const query = submissionQuery()
    query.single.mockResolvedValue({
      data: submissionRow({ feedback_comment: null }),
      error: null,
    })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue(query) }

    await updateSubmissionFeedback('submission-1', {
      rating: 1,
      reviewedBy: 'Ada Admin',
      feedbackComment: '   ',
    })
    await updateSubmissionFeedback('submission-1', {
      rating: 1,
      reviewedBy: 'Ada Admin',
    })

    expect(query.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ feedback_comment: null, reviewed_at: reviewedAt }),
    )
    expect(query.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ feedback_comment: null }),
    )

    query.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'feedback down' },
    })
    await expect(
      updateSubmissionFeedback('submission-1', {
        rating: 1,
        reviewedBy: 'Ada Admin',
      }),
    ).rejects.toEqual({ message: 'feedback down' })
  })
})
