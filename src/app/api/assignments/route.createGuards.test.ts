import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  requireAuthMock, isAdminUserMock, createAssignmentMock, getAssignmentStatsMock,
  enrichAssignmentListItemMock, sendAssignmentNotificationEmailMock, formatDueDateMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  createAssignmentMock: vi.fn(),
  getAssignmentStatsMock: vi.fn(),
  enrichAssignmentListItemMock: vi.fn(),
  sendAssignmentNotificationEmailMock: vi.fn(),
  formatDueDateMock: vi.fn(),
}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
  getStudentForEmail: vi.fn(),
}))

vi.mock('@/lib/auth/clerkUser', () => ({
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/assignments/assignmentService', () => ({
  createAssignment: createAssignmentMock,
  enrichAssignmentListItem: enrichAssignmentListItemMock,
  getAssignmentStats: getAssignmentStatsMock,
  getSubmissionForStudent: vi.fn(),
  listAssignmentsForAdmin: vi.fn(),
  listAssignmentsForStudent: vi.fn(),
}))

vi.mock('@/lib/assignments/assignmentEmail', () => ({
  sendAssignmentNotificationEmail: sendAssignmentNotificationEmailMock,
}))

vi.mock('@/lib/assignments/assignmentUtils', () => ({
  formatDueDate: formatDueDateMock,
}))

import { POST } from './route'

const cohortId = '11111111-1111-4111-8111-111111111111'

const validBody = {
  title: 'Week 1 Lab',
  description: 'Build the API',
  cohortId,
  category: 'Backend',
  googleGroupId: 'group-1',
  attachments: '',
  dueDate: '2026-08-01T12:00:00.000Z',
}

const createdAssignment = {
  id: 'assignment-1',
  title: 'Week 1 Lab',
  description: 'Build the API',
  cohortId,
  googleGroupId: 'group-1',
  attachments: null,
  dueDate: '2026-08-01T12:00:00.000Z',
}

function postAssignment() {
  return POST(
    new Request('http://localhost/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    }),
  )
}

describe('POST /api/assignments create guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_APP_URL
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'admin-1' }, email: 'admin@example.com' },
    })
    isAdminUserMock.mockReturnValue(true)
    createAssignmentMock.mockResolvedValue(createdAssignment)
    getAssignmentStatsMock.mockResolvedValue({ submitted: 0, total: 10 })
    enrichAssignmentListItemMock.mockImplementation(
      (assignment: typeof createdAssignment, stats: unknown) => ({
        ...assignment,
        stats,
      }),
    )
    formatDueDateMock.mockReturnValue('Aug 1, 2026')
    sendAssignmentNotificationEmailMock.mockResolvedValue({
      sentTo: 'group@googlegroups.com',
    })
  })

  it('builds the notification link on mentorbridge.in when the app URL is unset', async () => {
    const response = await postAssignment()

    expect(response.status).toBe(200)
    expect(sendAssignmentNotificationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        assignmentUrl:
          'https://mentorbridge.in/secured/assignments/assignment-1',
      }),
    )
  })

  it('keeps the assignment when email delivery fails with a non-Error', async () => {
    sendAssignmentNotificationEmailMock.mockRejectedValue('smtp down')

    const response = await postAssignment()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      assignment: { id: 'assignment-1' },
      emailSent: false,
      emailWarning: 'Failed to send notification email',
    })
  })

  it('returns the create error and does not email when saving fails', async () => {
    createAssignmentMock.mockRejectedValue(new Error('cohort missing'))

    const response = await postAssignment()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'cohort missing',
    })
    expect(sendAssignmentNotificationEmailMock).not.toHaveBeenCalled()
  })

  it('uses a generic message when create fails with a non-Error', async () => {
    createAssignmentMock.mockRejectedValue('db down')

    const response = await postAssignment()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not create assignment.',
    })
    expect(sendAssignmentNotificationEmailMock).not.toHaveBeenCalled()
  })
})
