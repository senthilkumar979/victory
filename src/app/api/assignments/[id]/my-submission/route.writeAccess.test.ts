import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  requireAuthMock,
  getStudentForEmailMock,
  isAdminUserMock,
  getAssignmentByIdMock,
  upsertSubmissionMock,
  isPastDueMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  getAssignmentByIdMock: vi.fn(),
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
  getSubmissionForStudent: vi.fn(),
  upsertSubmission: upsertSubmissionMock,
}))

vi.mock('@/lib/assignments/assignmentUtils', () => ({
  isPastDue: isPastDueMock,
}))

import { POST } from './route'

const assignmentId = 'assignment-1'
const student = {
  id: 'student-1',
  cohort_id: 'cohort-a',
  email: 'student@example.com',
}
const routeContext = { params: Promise.resolve({ id: assignmentId }) }
const docUrl = 'https://docs.google.com/document/d/abc123'
const repoUrl = 'https://github.com/org/repo'

function postRequest(body: unknown) {
  return new Request(
    `http://localhost/api/assignments/${assignmentId}/my-submission`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

describe('my-submission write gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'student@example.com' },
    })
    isAdminUserMock.mockReturnValue(false)
    getAssignmentByIdMock.mockResolvedValue({
      id: assignmentId,
      cohortId: 'cohort-a',
      dueDate: '2099-01-01T00:00:00.000Z',
    })
    getStudentForEmailMock.mockResolvedValue(student)
    isPastDueMock.mockReturnValue(false)
    upsertSubmissionMock.mockResolvedValue({ id: 'submission-1' })
  })

  it('rejects another cohort before the deadline', async () => {
    getStudentForEmailMock.mockResolvedValue({
      ...student,
      cohort_id: 'other-cohort',
    })
    isPastDueMock.mockReturnValue(true)

    const response = await POST(
      postRequest({ googleDocUrl: docUrl, githubRepoUrl: '' }),
      routeContext,
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
    expect(isPastDueMock).not.toHaveBeenCalled()
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })

  it('forbids an admin with no student profile from submitting for someone else', async () => {
    isAdminUserMock.mockReturnValue(true)
    getStudentForEmailMock.mockResolvedValue(null)

    const response = await POST(
      postRequest({
        studentId: 'student-other',
        googleDocUrl: docUrl,
        githubRepoUrl: '',
      }),
      routeContext,
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })

  it('ignores studentId from a non-admin', async () => {
    const response = await POST(
      postRequest({
        studentId: 'student-other',
        googleDocUrl: '',
        githubRepoUrl: repoUrl,
      }),
      routeContext,
    )

    expect(response.status).toBe(200)
    expect(upsertSubmissionMock).toHaveBeenCalledWith({
      assignmentId,
      studentId: student.id,
      googleDocUrl: '',
      githubRepoUrl: repoUrl,
    })
  })

  it('rejects an invalid Google Doc URL even when the repository is valid', async () => {
    const response = await POST(
      postRequest({
        googleDocUrl: 'https://example.com/not-a-doc',
        githubRepoUrl: repoUrl,
      }),
      routeContext,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Enter a valid Google Docs URL',
    })
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })
})
