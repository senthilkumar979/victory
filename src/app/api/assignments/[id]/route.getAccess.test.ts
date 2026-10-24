import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  requireAuthMock,
  isAdminUserMock,
  getStudentForEmailMock,
  getAssignmentByIdMock,
  getAssignmentStatsMock,
  enrichAssignmentListItemMock,
  getSubmissionForStudentMock,
  listSubmissionsForAssignmentMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
  getAssignmentByIdMock: vi.fn(),
  getAssignmentStatsMock: vi.fn(),
  enrichAssignmentListItemMock: vi.fn(),
  getSubmissionForStudentMock: vi.fn(),
  listSubmissionsForAssignmentMock: vi.fn(),
}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
  getStudentForEmail: getStudentForEmailMock,
}))

vi.mock('@/lib/auth/clerkUser', () => ({
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/assignments/assignmentService', () => ({
  deleteAssignment: vi.fn(),
  enrichAssignmentListItem: enrichAssignmentListItemMock,
  getAssignmentById: getAssignmentByIdMock,
  getAssignmentStats: getAssignmentStatsMock,
  getSubmissionForStudent: getSubmissionForStudentMock,
  listSubmissionsForAssignment: listSubmissionsForAssignmentMock,
  updateAssignment: vi.fn(),
}))

vi.mock('@/lib/assignments/assignmentEmail', () => ({
  sendAssignmentNotificationEmail: vi.fn(),
}))

vi.mock('@/lib/assignments/assignmentUtils', () => ({
  formatDueDate: vi.fn(),
}))

import { GET } from './route'

const cohortId = '11111111-1111-4111-8111-111111111111'
const assignment = { id: 'assignment-1', cohortId }

function callGet() {
  return GET(new Request('http://localhost/api/assignments/assignment-1'), {
    params: Promise.resolve({ id: 'assignment-1' }),
  })
}

describe('GET /api/assignments/[id] access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'ada@example.com' },
    })
    isAdminUserMock.mockReturnValue(false)
    getAssignmentByIdMock.mockResolvedValue(assignment)
    getAssignmentStatsMock.mockResolvedValue({ submitted: 1, total: 8 })
    enrichAssignmentListItemMock.mockImplementation((item, stats) => ({
      ...item,
      stats,
    }))
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-1',
      cohort_id: cohortId,
    })
    getSubmissionForStudentMock.mockResolvedValue({ id: 'sub-1' })
    listSubmissionsForAssignmentMock.mockResolvedValue([{ id: 'sub-1' }])
  })

  it('returns the auth response without loading the assignment', async () => {
    const unauthorized = Response.json({ error: 'Unauthorized' }, { status: 401 })
    requireAuthMock.mockResolvedValue({ response: unauthorized })

    await expect(callGet()).resolves.toBe(unauthorized)
    expect(getAssignmentByIdMock).not.toHaveBeenCalled()
  })

  it('returns 404 before looking up a student when the assignment is missing', async () => {
    getAssignmentByIdMock.mockResolvedValue(null)

    const response = await callGet()

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found' })
    expect(getStudentForEmailMock).not.toHaveBeenCalled()
  })

  it('lets only a matching cohort member load their own submission', async () => {
    const allowedBody = await (await callGet()).json()
    expect(allowedBody).toMatchObject({
      canSubmit: true,
      isAdmin: false,
      mySubmission: { id: 'sub-1' },
    })
    expect(allowedBody.submissions).toBeUndefined()
    expect(getStudentForEmailMock).toHaveBeenCalledWith('ada@example.com')
    expect(getSubmissionForStudentMock).toHaveBeenCalledWith(
      'assignment-1',
      'student-1',
    )
    expect(listSubmissionsForAssignmentMock).not.toHaveBeenCalled()

    getSubmissionForStudentMock.mockClear()
    for (const student of [
      { id: 'student-1', cohort_id: 'other-cohort' },
      { id: 'student-1', cohort_id: '' },
      null,
    ]) {
      getStudentForEmailMock.mockResolvedValueOnce(student)
      const body = await (await callGet()).json()
      expect(body.canSubmit).toBe(false)
      expect(body.mySubmission).toBeNull()
    }
    expect(getSubmissionForStudentMock).not.toHaveBeenCalled()
  })

  it('shows admins every submission even when their cohort matches', async () => {
    isAdminUserMock.mockReturnValue(true)

    const body = await (await callGet()).json()

    expect(body).toMatchObject({
      canSubmit: false,
      isAdmin: true,
      mySubmission: null,
      submissions: [{ id: 'sub-1' }],
    })
    expect(getSubmissionForStudentMock).not.toHaveBeenCalled()
    expect(listSubmissionsForAssignmentMock).toHaveBeenCalledWith('assignment-1')
  })
})
