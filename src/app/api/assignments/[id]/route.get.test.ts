import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  requireAuthMock,
  getStudentForEmailMock,
  isAdminUserMock,
  getAssignmentByIdMock,
  getAssignmentStatsMock,
  getSubmissionForStudentMock,
  listSubmissionsForAssignmentMock,
  enrichAssignmentListItemMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  getAssignmentByIdMock: vi.fn(),
  getAssignmentStatsMock: vi.fn(),
  getSubmissionForStudentMock: vi.fn(),
  listSubmissionsForAssignmentMock: vi.fn(),
  enrichAssignmentListItemMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

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

import { NextResponse } from 'next/server'

import { GET } from './route'

const assignment = { id: 'assignment-1', cohortId: 'cohort-1', title: 'Lab' }
const stats = { totalStudents: 10, submittedCount: 1 }
const context = { params: Promise.resolve({ id: 'assignment-1' }) }

describe('GET /api/assignments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'user@example.com' },
    })
    isAdminUserMock.mockReturnValue(false)
    getAssignmentByIdMock.mockResolvedValue(assignment)
    getAssignmentStatsMock.mockResolvedValue(stats)
    enrichAssignmentListItemMock.mockImplementation(
      (item: typeof assignment, itemStats: typeof stats) => ({
        ...item,
        stats: itemStats,
      }),
    )
    getStudentForEmailMock.mockResolvedValue(null)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('forwards the unauthorized response from requireAuth', async () => {
    requireAuthMock.mockResolvedValue({
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await GET(new Request('http://localhost/api/assignments/1'), context)

    expect(response.status).toBe(401)
    expect(getAssignmentByIdMock).not.toHaveBeenCalled()
  })

  it('returns 404 when the assignment does not exist', async () => {
    getAssignmentByIdMock.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/api/assignments/1'), context)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found' })
    expect(listSubmissionsForAssignmentMock).not.toHaveBeenCalled()
  })

  it('includes all submissions for admins and never allows submit', async () => {
    isAdminUserMock.mockReturnValue(true)
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-admin',
      cohort_id: 'cohort-1',
    })
    listSubmissionsForAssignmentMock.mockResolvedValue([{ id: 'sub-1' }])

    const response = await GET(new Request('http://localhost/api/assignments/1'), context)

    expect(listSubmissionsForAssignmentMock).toHaveBeenCalledWith('assignment-1')
    expect(getSubmissionForStudentMock).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      assignment: { ...assignment, stats },
      mySubmission: null,
      submissions: [{ id: 'sub-1' }],
      isAdmin: true,
      canSubmit: false,
    })
  })

  it('lets a matching-cohort student submit and loads only their submission', async () => {
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-1',
      cohort_id: 'cohort-1',
    })
    getSubmissionForStudentMock.mockResolvedValue({ id: 'mine' })

    const response = await GET(new Request('http://localhost/api/assignments/1'), context)

    expect(getSubmissionForStudentMock).toHaveBeenCalledWith(
      'assignment-1',
      'student-1',
    )
    expect(listSubmissionsForAssignmentMock).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      assignment: { ...assignment, stats },
      mySubmission: { id: 'mine' },
      submissions: undefined,
      isAdmin: false,
      canSubmit: true,
    })
  })

  it('does not allow submit or leak submissions for a different cohort', async () => {
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-1',
      cohort_id: 'other-cohort',
    })

    const response = await GET(new Request('http://localhost/api/assignments/1'), context)

    expect(getSubmissionForStudentMock).not.toHaveBeenCalled()
    expect(listSubmissionsForAssignmentMock).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      canSubmit: false,
      isAdmin: false,
      mySubmission: null,
    })
  })

  it('maps lookup failures to 500', async () => {
    getAssignmentByIdMock.mockRejectedValue(new Error('db down'))

    const response = await GET(new Request('http://localhost/api/assignments/1'), context)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load assignment.',
    })
  })
})
