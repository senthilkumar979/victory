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

function makeRequest() {
  return new Request(
    `http://localhost/api/assignments/${assignmentId}/submissions/${submissionId}/feedback`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    },
  )
}

const routeContext = {
  params: Promise.resolve({ id: assignmentId, submissionId }),
}

describe('PATCH feedback student name fallback', () => {
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
      studentName: 'Name on the row before save',
    })
    sendSubmissionFeedbackEmailMock.mockResolvedValue(undefined)
  })

  it('uses Student when the saved row has a null name but a deliverable email', async () => {
    updateSubmissionFeedbackMock.mockResolvedValue({
      id: submissionId,
      assignmentId,
      studentEmail: 'student@example.com',
      studentName: null,
      rating: 4.5,
    })

    const response = await PATCH(makeRequest(), routeContext)

    expect(response.status).toBe(200)
    expect(sendSubmissionFeedbackEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'student@example.com',
        studentName: 'Student',
        assignmentTitle: 'Week 1 Lab',
        rating: 4.5,
        reviewedBy: 'Ada Lovelace',
      }),
    )
  })

  it('uses Student when the student join omits a name', async () => {
    updateSubmissionFeedbackMock.mockResolvedValue({
      id: submissionId,
      assignmentId,
      studentEmail: 'student@example.com',
      rating: 4.5,
    })

    const response = await PATCH(makeRequest(), routeContext)

    expect(response.status).toBe(200)
    expect(sendSubmissionFeedbackEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'student@example.com',
        studentName: 'Student',
      }),
    )
  })
})
