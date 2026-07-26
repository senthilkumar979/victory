import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  requireAuthMock,
  isAdminUserMock,
  getAssignmentByIdMock,
  getSubmissionByIdMock,
  updateSubmissionFeedbackMock,
  sendSubmissionFeedbackEmailMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  getAssignmentByIdMock: vi.fn(),
  getSubmissionByIdMock: vi.fn(),
  updateSubmissionFeedbackMock: vi.fn(),
  sendSubmissionFeedbackEmailMock: vi.fn(),
}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
}))

vi.mock('@/lib/auth/clerkUser', () => ({
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/assignments/assignmentService', () => ({
  getAssignmentById: getAssignmentByIdMock,
  getSubmissionById: getSubmissionByIdMock,
  updateSubmissionFeedback: updateSubmissionFeedbackMock,
}))

vi.mock('@/lib/assignments/assignmentEmail', () => ({
  sendSubmissionFeedbackEmail: sendSubmissionFeedbackEmailMock,
}))

import { PATCH } from './route'

const assignmentId = 'assignment-1'
const submissionId = 'submission-1'

const validBody = {
  rating: '4.5',
  reviewedBy: 'Ada Lovelace',
  feedbackComment: 'Nice edge-case handling',
}

function makeRequest(body: unknown = validBody) {
  return new Request(
    `http://localhost/api/assignments/${assignmentId}/submissions/${submissionId}/feedback`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

const routeContext = {
  params: Promise.resolve({ id: assignmentId, submissionId }),
}

describe('PATCH /api/assignments/[id]/submissions/[submissionId]/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'admin-1' }, email: 'admin@example.com' },
    })
    isAdminUserMock.mockReturnValue(true)
    getAssignmentByIdMock.mockResolvedValue({
      id: assignmentId,
      title: 'Week 1 Lab',
    })
    getSubmissionByIdMock.mockResolvedValue({
      id: submissionId,
      assignmentId,
      studentEmail: 'student@example.com',
      studentName: 'Grace',
    })
    updateSubmissionFeedbackMock.mockResolvedValue({
      id: submissionId,
      assignmentId,
      studentEmail: 'student@example.com',
      studentName: 'Grace',
      rating: 4.5,
      reviewedBy: 'Ada Lovelace',
      feedbackComment: 'Nice edge-case handling',
    })
    sendSubmissionFeedbackEmailMock.mockResolvedValue(undefined)
  })

  it('short-circuits when authentication fails', async () => {
    const unauthorized = Response.json({ error: 'Unauthorized' }, { status: 401 })
    requireAuthMock.mockResolvedValue({ response: unauthorized })

    const response = await PATCH(makeRequest(), routeContext)

    expect(response).toBe(unauthorized)
    expect(getAssignmentByIdMock).not.toHaveBeenCalled()
  })

  it('rejects non-admin callers before loading submission data', async () => {
    isAdminUserMock.mockReturnValue(false)

    const response = await PATCH(makeRequest(), routeContext)

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
    expect(getAssignmentByIdMock).not.toHaveBeenCalled()
  })

  it('returns 404 when the assignment or submission is missing', async () => {
    getAssignmentByIdMock.mockResolvedValueOnce(null)

    const missingAssignment = await PATCH(makeRequest(), routeContext)
    expect(missingAssignment.status).toBe(404)
    await expect(missingAssignment.json()).resolves.toEqual({
      error: 'Assignment not found',
    })

    getSubmissionByIdMock.mockResolvedValueOnce({
      id: submissionId,
      assignmentId: 'other-assignment',
      studentEmail: 'student@example.com',
    })

    const missingSubmission = await PATCH(makeRequest(), routeContext)
    expect(missingSubmission.status).toBe(404)
    await expect(missingSubmission.json()).resolves.toEqual({
      error: 'Submission not found',
    })
    expect(updateSubmissionFeedbackMock).not.toHaveBeenCalled()
  })

  it('rejects invalid feedback payloads before updating', async () => {
    const response = await PATCH(
      makeRequest({ rating: '9', reviewedBy: '' }),
      routeContext,
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(typeof body.error).toBe('string')
    expect(updateSubmissionFeedbackMock).not.toHaveBeenCalled()
  })

  it('saves feedback and emails the student when an address is present', async () => {
    const response = await PATCH(makeRequest(), routeContext)

    expect(updateSubmissionFeedbackMock).toHaveBeenCalledWith(submissionId, {
      rating: 4.5,
      reviewedBy: 'Ada Lovelace',
      feedbackComment: 'Nice edge-case handling',
    })
    expect(sendSubmissionFeedbackEmailMock).toHaveBeenCalledWith({
      to: 'student@example.com',
      studentName: 'Grace',
      assignmentTitle: 'Week 1 Lab',
      rating: 4.5,
      reviewedBy: 'Ada Lovelace',
      feedbackComment: 'Nice edge-case handling',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      submission: { id: submissionId, rating: 4.5 },
    })
  })

  it('keeps the saved feedback when the notification email fails', async () => {
    sendSubmissionFeedbackEmailMock.mockRejectedValue(
      new Error('Resend unavailable'),
    )
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await PATCH(makeRequest(), routeContext)

    expect(updateSubmissionFeedbackMock).toHaveBeenCalled()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      submission: { id: submissionId },
    })
  })

  it('skips email delivery when the submission has no student email', async () => {
    getSubmissionByIdMock.mockResolvedValue({
      id: submissionId,
      assignmentId,
      studentEmail: null,
      studentName: null,
    })
    updateSubmissionFeedbackMock.mockResolvedValue({
      id: submissionId,
      assignmentId,
      studentEmail: null,
      studentName: null,
      rating: 4.5,
      reviewedBy: 'Ada Lovelace',
    })

    const response = await PATCH(makeRequest(), routeContext)

    expect(sendSubmissionFeedbackEmailMock).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
  })
})
