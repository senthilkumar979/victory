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
const student = { id: 'student-1', cohort_id: 'cohort-a' }
const routeContext = { params: Promise.resolve({ id: assignmentId }) }
const docUrl = 'https://docs.google.com/document/d/abc123'

function getRequest() {
  return new Request(
    `http://localhost/api/assignments/${assignmentId}/my-submission`,
  )
}

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

describe('my-submission failure responses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
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
  })

  it('GET hides database error text', async () => {
    getAssignmentByIdMock.mockRejectedValue(new Error('secret connection string'))

    const response = await GET(getRequest(), routeContext)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load submission.',
    })
  })

  it('POST returns 404 before looking up a student when the assignment is missing', async () => {
    getAssignmentByIdMock.mockResolvedValue(null)

    const response = await POST(
      postRequest({ googleDocUrl: docUrl, githubRepoUrl: '' }),
      routeContext,
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found' })
    expect(getStudentForEmailMock).not.toHaveBeenCalled()
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })

  it('POST keeps an Error message and replaces a non-Error throw', async () => {
    upsertSubmissionMock.mockRejectedValueOnce(new Error('duplicate key'))

    const fromError = await POST(
      postRequest({ googleDocUrl: docUrl, githubRepoUrl: '' }),
      routeContext,
    )

    expect(fromError.status).toBe(500)
    await expect(fromError.json()).resolves.toEqual({ error: 'duplicate key' })

    upsertSubmissionMock.mockRejectedValueOnce('boom')
    const fromString = await POST(
      postRequest({ googleDocUrl: docUrl, githubRepoUrl: '' }),
      routeContext,
    )

    expect(fromString.status).toBe(500)
    await expect(fromString.json()).resolves.toEqual({
      error: 'Could not save submission.',
    })
  })
})
