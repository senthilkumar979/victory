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

import { NextResponse } from 'next/server'

import { GET } from './route'

const assignment = { id: 'assignment-1', cohortId: 'cohort-1', title: 'Lab' }
const stats = { totalStudents: 10, submittedCount: 2 }

describe('GET /api/assignments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'user@example.com' },
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
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('forwards the unauthorized response from requireAuth', async () => {
    requireAuthMock.mockResolvedValue({
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await GET()

    expect(response.status).toBe(401)
    expect(listAssignmentsForAdminMock).not.toHaveBeenCalled()
    expect(listAssignmentsForStudentMock).not.toHaveBeenCalled()
  })

  it('lists every assignment for admins without loading a student profile', async () => {
    isAdminUserMock.mockReturnValue(true)
    listAssignmentsForAdminMock.mockResolvedValue([assignment])

    const response = await GET()

    expect(listAssignmentsForAdminMock).toHaveBeenCalledTimes(1)
    expect(getStudentForEmailMock).not.toHaveBeenCalled()
    expect(listAssignmentsForStudentMock).not.toHaveBeenCalled()
    expect(getSubmissionForStudentMock).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      assignments: [{ ...assignment, stats, mySubmissionStatus: undefined }],
      isAdmin: true,
    })
  })

  it('returns an empty list when a student has no cohort', async () => {
    getStudentForEmailMock.mockResolvedValue({ id: 'student-1', cohort_id: null })

    const response = await GET()

    expect(listAssignmentsForStudentMock).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      assignments: [],
      isAdmin: false,
    })
  })

  it('scopes student lists to their cohort and marks submission status', async () => {
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-1',
      cohort_id: 'cohort-1',
    })
    listAssignmentsForStudentMock.mockResolvedValue([assignment])
    getSubmissionForStudentMock.mockResolvedValue({ id: 'sub-1' })

    const response = await GET()

    expect(listAssignmentsForStudentMock).toHaveBeenCalledWith('cohort-1')
    expect(getSubmissionForStudentMock).toHaveBeenCalledWith(
      'assignment-1',
      'student-1',
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      assignments: [
        { ...assignment, stats, mySubmissionStatus: 'submitted' },
      ],
      isAdmin: false,
    })
  })

  it('maps service failures to 500 without leaking internals', async () => {
    isAdminUserMock.mockReturnValue(true)
    listAssignmentsForAdminMock.mockRejectedValue(new Error('db down'))

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load assignments.',
    })
  })
})
