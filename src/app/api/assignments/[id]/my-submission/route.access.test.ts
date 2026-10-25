import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  requireAuthMock,
  getStudentForEmailMock,
  isAdminUserMock,
  getAssignmentByIdMock,
  getSubmissionForStudentMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  getAssignmentByIdMock: vi.fn(),
  getSubmissionForStudentMock: vi.fn(),
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
  upsertSubmission: vi.fn(),
}))

vi.mock('@/lib/assignments/assignmentUtils', () => ({
  isPastDue: vi.fn(),
}))

import { GET } from './route'

const assignmentId = 'assignment-1'
const assignment = {
  id: assignmentId,
  title: 'Week 1 Lab',
  cohortId: 'cohort-a',
  dueDate: '2099-01-01T00:00:00.000Z',
}
const student = {
  id: 'student-1',
  cohort_id: 'cohort-a',
  email: 'student@example.com',
}
const routeContext = { params: Promise.resolve({ id: assignmentId }) }

function getRequest() {
  return new Request(
    `http://localhost/api/assignments/${assignmentId}/my-submission`,
  )
}

describe('my-submission access gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'student@example.com' },
    })
    isAdminUserMock.mockReturnValue(false)
    getAssignmentByIdMock.mockResolvedValue(assignment)
    getStudentForEmailMock.mockResolvedValue(student)
    getSubmissionForStudentMock.mockResolvedValue(null)
  })

  it('GET returns 404 before loading a student when the assignment is missing', async () => {
    getAssignmentByIdMock.mockResolvedValue(null)

    const response = await GET(getRequest(), routeContext)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found' })
    expect(getStudentForEmailMock).not.toHaveBeenCalled()
    expect(getSubmissionForStudentMock).not.toHaveBeenCalled()
  })

  it('GET forbids an empty student id and a row owned by someone else', async () => {
    getStudentForEmailMock.mockResolvedValueOnce({ ...student, id: '' })

    const missingProfile = await GET(getRequest(), routeContext)

    expect(missingProfile.status).toBe(403)
    expect(getSubmissionForStudentMock).not.toHaveBeenCalled()

    getSubmissionForStudentMock.mockResolvedValue({
      id: 'submission-9',
      studentId: 'someone-else',
    })
    const foreignRow = await GET(getRequest(), routeContext)

    expect(foreignRow.status).toBe(403)
    await expect(foreignRow.json()).resolves.toEqual({ error: 'Forbidden' })
  })

  it('GET returns the caller row and lets an admin read across cohorts', async () => {
    const submission = { id: 'submission-9', studentId: student.id }
    getSubmissionForStudentMock.mockResolvedValue(submission)

    const own = await GET(getRequest(), routeContext)

    expect(own.status).toBe(200)
    await expect(own.json()).resolves.toEqual({ submission })

    isAdminUserMock.mockReturnValue(true)
    getStudentForEmailMock.mockResolvedValue({
      ...student,
      cohort_id: 'other-cohort',
    })
    getSubmissionForStudentMock.mockResolvedValue({
      id: 'submission-2',
      studentId: 'other-student',
    })

    const admin = await GET(getRequest(), routeContext)

    expect(admin.status).toBe(200)
    expect(getSubmissionForStudentMock).toHaveBeenLastCalledWith(
      assignmentId,
      student.id,
    )
  })
})
