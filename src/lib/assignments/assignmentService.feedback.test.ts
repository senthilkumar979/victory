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

import { updateSubmissionFeedback } from './assignmentService'

const savedAt = '2026-10-26T23:30:00.000Z'

const submissionRow = {
  id: 'submission-1',
  assignment_id: 'assignment-1',
  student_id: 'student-1',
  google_doc_url: 'https://docs.google.com/document/d/abc',
  github_repo_url: '',
  submitted_at: '2026-10-01T00:00:00.000Z',
  updated_at: savedAt,
  rating: '4.5',
  feedback_comment: 'Clear structure.',
  reviewed_by: 'Ada Lovelace',
  reviewed_at: savedAt,
  students: { name: null, email: 'student@example.com' },
}

function mockUpdate(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn().mockReturnValue({ single })
  const eq = vi.fn().mockReturnValue({ select })
  const update = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ update })
  supabaseAdminState.client = { from }
  return { from, update, eq, select }
}

describe('updateSubmissionFeedback', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
    vi.useFakeTimers()
    vi.setSystemTime(new Date(savedAt))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws when the server database is not configured', async () => {
    await expect(
      updateSubmissionFeedback('submission-1', {
        rating: 4.5,
        reviewedBy: 'Ada Lovelace',
      }),
    ).rejects.toThrow('Server database is not configured.')
  })

  it('stores a trimmed comment, stamps reviewed_at, and keeps a null student name', async () => {
    const { from, update, eq, select } = mockUpdate({
      data: submissionRow,
      error: null,
    })

    const saved = await updateSubmissionFeedback('submission-1', {
      rating: 4.5,
      reviewedBy: 'Ada Lovelace',
      feedbackComment: '  Clear structure.  ',
    })

    expect(from).toHaveBeenCalledWith('assignment_submissions')
    expect(update).toHaveBeenCalledWith({
      rating: 4.5,
      reviewed_by: 'Ada Lovelace',
      feedback_comment: 'Clear structure.',
      reviewed_at: savedAt,
    })
    expect(eq).toHaveBeenCalledWith('id', 'submission-1')
    expect(select).toHaveBeenCalledWith('*, students(name, email)')
    expect(saved).toMatchObject({
      id: 'submission-1',
      studentName: null,
      studentEmail: 'student@example.com',
      rating: 4.5,
      feedbackComment: 'Clear structure.',
      reviewedBy: 'Ada Lovelace',
      reviewedAt: savedAt,
    })
  })

  it('clears blank comments and maps a missing student join to undefined', async () => {
    const { update } = mockUpdate({
      data: {
        ...submissionRow,
        rating: null,
        feedback_comment: null,
        reviewed_by: 'Ada Lovelace',
        students: null,
      },
      error: null,
    })

    const saved = await updateSubmissionFeedback('submission-1', {
      rating: 4,
      reviewedBy: 'Ada Lovelace',
      feedbackComment: '   ',
    })

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ feedback_comment: null, rating: 4 }),
    )
    expect(saved.studentName).toBeUndefined()
    expect(saved.studentEmail).toBeUndefined()
    expect(saved.rating).toBeNull()
    expect(saved.feedbackComment).toBeNull()
  })

  it('stores null when the comment is omitted', async () => {
    const { update } = mockUpdate({
      data: { ...submissionRow, feedback_comment: null, students: null },
      error: null,
    })

    await updateSubmissionFeedback('submission-1', {
      rating: 3,
      reviewedBy: 'Ada Lovelace',
    })

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ feedback_comment: null, rating: 3 }),
    )
  })

  it('rethrows the database error', async () => {
    const dbError = { message: 'check constraint', code: '23514' }
    mockUpdate({ data: null, error: dbError })

    await expect(
      updateSubmissionFeedback('submission-1', {
        rating: 4,
        reviewedBy: 'Ada Lovelace',
        feedbackComment: 'Looks good',
      }),
    ).rejects.toEqual(dbError)
  })
})
