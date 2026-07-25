import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  requireAuthMock,
  isAdminUserMock,
  updateAssignmentMock,
  getAssignmentStatsMock,
  enrichAssignmentListItemMock,
  sendAssignmentNotificationEmailMock,
  formatDueDateMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  updateAssignmentMock: vi.fn(),
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
  deleteAssignment: vi.fn(),
  enrichAssignmentListItem: enrichAssignmentListItemMock,
  getAssignmentById: vi.fn(),
  getAssignmentStats: getAssignmentStatsMock,
  getSubmissionForStudent: vi.fn(),
  listSubmissionsForAssignment: vi.fn(),
  updateAssignment: updateAssignmentMock,
}))

vi.mock('@/lib/assignments/assignmentEmail', () => ({
  sendAssignmentNotificationEmail: sendAssignmentNotificationEmailMock,
}))

vi.mock('@/lib/assignments/assignmentUtils', () => ({
  formatDueDate: formatDueDateMock,
}))

import { PATCH } from './route'

const cohortId = '11111111-1111-4111-8111-111111111111'

const validBody = {
  title: 'Week 1 Lab',
  description: 'Build the API',
  cohortId,
  category: 'Backend',
  googleGroupId: 'group-1',
  attachments: 'https://docs.example.com/lab',
  dueDate: '2026-08-01T12:00:00.000Z',
}

const updatedAssignment = {
  id: 'assignment-1',
  title: 'Week 1 Lab',
  description: 'Build the API',
  cohortId,
  googleGroupId: 'group-1',
  attachments: 'https://docs.example.com/lab',
  dueDate: '2026-08-01T12:00:00.000Z',
}

describe('PATCH /api/assignments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'admin-1' }, email: 'admin@example.com' },
    })
    isAdminUserMock.mockReturnValue(true)
    updateAssignmentMock.mockResolvedValue(updatedAssignment)
    getAssignmentStatsMock.mockResolvedValue({ submitted: 2, total: 10 })
    enrichAssignmentListItemMock.mockImplementation((assignment, stats) => ({
      ...assignment,
      stats,
    }))
    formatDueDateMock.mockReturnValue('Aug 1, 2026')
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com'
  })

  it('rejects non-admin callers before updating an assignment', async () => {
    isAdminUserMock.mockReturnValue(false)

    const response = await PATCH(
      new Request('http://localhost/api/assignments/assignment-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      }),
      { params: Promise.resolve({ id: 'assignment-1' }) },
    )

    expect(response.status).toBe(403)
    expect(updateAssignmentMock).not.toHaveBeenCalled()
  })

  it('prefixes the update email title and preserves the assignment on email failure', async () => {
    sendAssignmentNotificationEmailMock.mockRejectedValue('smtp down')

    const response = await PATCH(
      new Request('http://localhost/api/assignments/assignment-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      }),
      { params: Promise.resolve({ id: 'assignment-1' }) },
    )

    expect(updateAssignmentMock).toHaveBeenCalledWith(
      'assignment-1',
      expect.objectContaining({
        title: 'Week 1 Lab',
        googleGroupId: 'group-1',
        attachments: 'https://docs.example.com/lab',
      }),
    )
    expect(sendAssignmentNotificationEmailMock).toHaveBeenCalledWith({
      googleGroupId: 'group-1',
      title: '[Updated] Week 1 Lab',
      description: 'Build the API',
      dueDate: 'Aug 1, 2026',
      assignmentUrl: 'https://app.example.com/secured/assignments/assignment-1',
      attachmentsUrl: 'https://docs.example.com/lab',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      assignment: { id: 'assignment-1' },
      emailSent: false,
      emailWarning: 'Failed to send notification email',
    })
  })
})
