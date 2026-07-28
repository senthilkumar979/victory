import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  requireAuthMock,
  getStudentForEmailMock,
  isAdminUserMock,
  getAssignmentByIdMock,
  getSubmissionByIdMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  getAssignmentByIdMock: vi.fn(),
  getSubmissionByIdMock: vi.fn(),
}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
  getStudentForEmail: getStudentForEmailMock,
}))

vi.mock('@/lib/auth/clerkUser', () => ({
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/assignments/assignmentService', () => ({
  getAssignmentById: getAssignmentByIdMock,
  getSubmissionById: getSubmissionByIdMock,
}))

import { GET } from './route'

const assignmentId = 'assignment-1'
const submissionId = 'submission-1'

const assignment = {
  id: assignmentId,
  title: 'Week 1 Lab',
  cohortId: 'cohort-a',
}

const submission = {
  id: submissionId,
  assignmentId,
  studentId: 'student-1',
  googleDocUrl: 'https://docs.google.com/document/d/abc',
  githubRepoUrl: '',
}

const routeContext = {
  params: Promise.resolve({ id: assignmentId, submissionId }),
}

describe('GET /api/assignments/[id]/submissions/[submissionId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'student@example.com' },
    })
    isAdminUserMock.mockReturnValue(false)
    getAssignmentByIdMock.mockResolvedValue(assignment)
    getSubmissionByIdMock.mockResolvedValue(submission)
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-1',
      email: 'student@example.com',
    })
  })

  it('short-circuits when authentication fails', async () => {
    const unauthorized = Response.json({ error: 'Unauthorized' }, { status: 401 })
    requireAuthMock.mockResolvedValue({ response: unauthorized })

    const response = await GET(
      new Request('http://localhost/api/assignments/submission'),
      routeContext,
    )

    expect(response).toBe(unauthorized)
    expect(getAssignmentByIdMock).not.toHaveBeenCalled()
  })

  it('returns 404 when the assignment does not exist', async () => {
    getAssignmentByIdMock.mockResolvedValue(null)

    const response = await GET(
      new Request('http://localhost/api/assignments/submission'),
      routeContext,
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found' })
    expect(getSubmissionByIdMock).not.toHaveBeenCalled()
  })

  it('returns 404 when the submission is missing or belongs to another assignment', async () => {
    getSubmissionByIdMock.mockResolvedValue({
      ...submission,
      assignmentId: 'other-assignment',
    })

    const response = await GET(
      new Request('http://localhost/api/assignments/submission'),
      routeContext,
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found' })
    expect(getStudentForEmailMock).not.toHaveBeenCalled()
  })

  it('forbids non-admins from reading another student submission', async () => {
    getStudentForEmailMock.mockResolvedValue({
      id: 'other-student',
      email: 'student@example.com',
    })

    const response = await GET(
      new Request('http://localhost/api/assignments/submission'),
      routeContext,
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
  })

  it('forbids non-admins when no matching student profile exists', async () => {
    getStudentForEmailMock.mockResolvedValue(null)

    const response = await GET(
      new Request('http://localhost/api/assignments/submission'),
      routeContext,
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
  })

  it('returns the submission for the owning student', async () => {
    const response = await GET(
      new Request('http://localhost/api/assignments/submission'),
      routeContext,
    )

    expect(getSubmissionByIdMock).toHaveBeenCalledWith(submissionId)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      submission,
      assignment,
    })
  })

  it('lets admins read any submission without student ownership checks', async () => {
    isAdminUserMock.mockReturnValue(true)
    getSubmissionByIdMock.mockResolvedValue({
      ...submission,
      studentId: 'another-student',
    })

    const response = await GET(
      new Request('http://localhost/api/assignments/submission'),
      routeContext,
    )

    expect(getStudentForEmailMock).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      submission: { ...submission, studentId: 'another-student' },
      assignment,
    })
  })

  it('returns 500 when loading the submission throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    getSubmissionByIdMock.mockRejectedValue(new Error('db down'))

    const response = await GET(
      new Request('http://localhost/api/assignments/submission'),
      routeContext,
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load submission.',
    })
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
