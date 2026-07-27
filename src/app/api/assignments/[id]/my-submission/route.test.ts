import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  requireAuthMock,
  getStudentForEmailMock,
  isAdminUserMock,
  getAssignmentByIdMock,
  getSubmissionForStudentMock,
  upsertSubmissionMock,
  isPastDueMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  getAssignmentByIdMock: vi.fn(),
  getSubmissionForStudentMock: vi.fn(),
  upsertSubmissionMock: vi.fn(),
  isPastDueMock: vi.fn(),
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
  getSubmissionForStudent: getSubmissionForStudentMock,
  upsertSubmission: upsertSubmissionMock,
}))

vi.mock('@/lib/assignments/assignmentUtils', () => ({
  isPastDue: isPastDueMock,
}))

import { GET, POST } from './route'

const assignmentId = 'assignment-1'
const dueDate = '2099-01-01T00:00:00.000Z'

const assignment = {
  id: assignmentId,
  title: 'Week 1 Lab',
  cohortId: 'cohort-a',
  dueDate,
}

const student = {
  id: 'student-1',
  cohort_id: 'cohort-a',
  email: 'student@example.com',
}

const routeContext = {
  params: Promise.resolve({ id: assignmentId }),
}

function makePostRequest(body: unknown) {
  return new Request(
    `http://localhost/api/assignments/${assignmentId}/my-submission`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

describe('/api/assignments/[id]/my-submission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'student@example.com' },
    })
    isAdminUserMock.mockReturnValue(false)
    getAssignmentByIdMock.mockResolvedValue(assignment)
    getStudentForEmailMock.mockResolvedValue(student)
    getSubmissionForStudentMock.mockResolvedValue(null)
    isPastDueMock.mockReturnValue(false)
    upsertSubmissionMock.mockResolvedValue({
      id: 'submission-1',
      assignmentId,
      studentId: student.id,
    })
  })

  it('GET short-circuits when authentication fails', async () => {
    const unauthorized = Response.json({ error: 'Unauthorized' }, { status: 401 })
    requireAuthMock.mockResolvedValue({ response: unauthorized })

    const response = await GET(
      new Request(`http://localhost/api/assignments/${assignmentId}/my-submission`),
      routeContext,
    )

    expect(response).toBe(unauthorized)
    expect(getAssignmentByIdMock).not.toHaveBeenCalled()
  })

  it('GET forbids students outside the assignment cohort', async () => {
    getStudentForEmailMock.mockResolvedValue({
      ...student,
      cohort_id: 'other-cohort',
    })

    const response = await GET(
      new Request(`http://localhost/api/assignments/${assignmentId}/my-submission`),
      routeContext,
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
    expect(getSubmissionForStudentMock).not.toHaveBeenCalled()
  })

  it('GET returns null when the authenticated student has no submission', async () => {
    const response = await GET(
      new Request(`http://localhost/api/assignments/${assignmentId}/my-submission`),
      routeContext,
    )

    expect(getSubmissionForStudentMock).toHaveBeenCalledWith(
      assignmentId,
      student.id,
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ submission: null })
  })

  it('POST rejects submissions after the deadline for non-admins', async () => {
    isPastDueMock.mockReturnValue(true)

    const response = await POST(
      makePostRequest({
        googleDocUrl: 'https://docs.google.com/document/d/abc123',
        githubRepoUrl: '',
      }),
      routeContext,
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      error: 'Submission deadline has passed.',
    })
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })

  it('POST requires at least one valid submission URL', async () => {
    const response = await POST(
      makePostRequest({ googleDocUrl: '  ', githubRepoUrl: '' }),
      routeContext,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Provide at least one URL — Google Doc or GitHub repository',
    })
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })

  it('POST lets admins submit for another student after the deadline', async () => {
    isAdminUserMock.mockReturnValue(true)
    isPastDueMock.mockReturnValue(true)

    const response = await POST(
      makePostRequest({
        studentId: 'student-other',
        googleDocUrl: '',
        githubRepoUrl: 'https://github.com/org/repo',
      }),
      routeContext,
    )

    expect(isPastDueMock).not.toHaveBeenCalled()
    expect(upsertSubmissionMock).toHaveBeenCalledWith({
      assignmentId,
      studentId: 'student-other',
      googleDocUrl: '',
      githubRepoUrl: 'https://github.com/org/repo',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      submission: { id: 'submission-1' },
    })
  })

  it('POST upserts the authenticated student submission when valid', async () => {
    const response = await POST(
      makePostRequest({
        googleDocUrl: 'https://docs.google.com/document/d/abc123',
        githubRepoUrl: '',
      }),
      routeContext,
    )

    expect(upsertSubmissionMock).toHaveBeenCalledWith({
      assignmentId,
      studentId: student.id,
      googleDocUrl: 'https://docs.google.com/document/d/abc123',
      githubRepoUrl: '',
    })
    expect(response.status).toBe(200)
  })
})
