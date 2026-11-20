import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  requireAuthMock,
  getStudentForEmailMock,
  isAdminUserMock,
  listAssignmentsForAdminMock,
  listAssignmentsForStudentMock,
  getAssignmentStatsMock,
  getSubmissionForStudentMock,
  enrichAssignmentListItemMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  listAssignmentsForAdminMock: vi.fn(),
  listAssignmentsForStudentMock: vi.fn(),
  getAssignmentStatsMock: vi.fn(),
  getSubmissionForStudentMock: vi.fn(),
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
  createAssignment: vi.fn(),
  enrichAssignmentListItem: enrichAssignmentListItemMock,
  getAssignmentStats: getAssignmentStatsMock,
  getSubmissionForStudent: getSubmissionForStudentMock,
  listAssignmentsForAdmin: listAssignmentsForAdminMock,
  listAssignmentsForStudent: listAssignmentsForStudentMock,
}))

vi.mock('@/lib/assignments/assignmentEmail', () => ({
  sendAssignmentNotificationEmail: vi.fn(),
}))

vi.mock('@/lib/assignments/assignmentUtils', () => ({
  formatDueDate: vi.fn(),
}))

import { GET } from './route'

const assignment = { id: 'assignment-1', cohortId: 'cohort-1', title: 'Lab' }
const stats = { totalStudents: 10, submittedCount: 2 }

describe('GET /api/assignments empty cohort guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'student@example.com' },
    })
    isAdminUserMock.mockReturnValue(false)
    getAssignmentStatsMock.mockResolvedValue(stats)
    enrichAssignmentListItemMock.mockImplementation(
      (item: typeof assignment, itemStats: typeof stats, status?: string) => ({
        ...item,
        stats: itemStats,
        mySubmissionStatus: status,
      }),
    )
  })

  it('returns an empty list when the signed-in email has no student row', async () => {
    getStudentForEmailMock.mockResolvedValue(null)

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      assignments: [],
      isAdmin: false,
    })
    expect(listAssignmentsForStudentMock).not.toHaveBeenCalled()
    expect(listAssignmentsForAdminMock).not.toHaveBeenCalled()
  })

  it('returns an empty list when the student cohort id is blank', async () => {
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-1',
      cohort_id: '',
    })

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      assignments: [],
      isAdmin: false,
    })
    expect(listAssignmentsForStudentMock).not.toHaveBeenCalled()
  })

  it('marks an assignment not submitted when the student has no submission row', async () => {
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-1',
      cohort_id: 'cohort-1',
    })
    listAssignmentsForStudentMock.mockResolvedValue([assignment])
    getSubmissionForStudentMock.mockResolvedValue(null)

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      assignments: [
        { ...assignment, stats, mySubmissionStatus: 'not_submitted' },
      ],
      isAdmin: false,
    })
    expect(getSubmissionForStudentMock).toHaveBeenCalledWith(
      'assignment-1',
      'student-1',
    )
  })
})
