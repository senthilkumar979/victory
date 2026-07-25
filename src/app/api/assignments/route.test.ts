import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  requireAuthMock,
  isAdminUserMock,
  createAssignmentMock,
  getAssignmentStatsMock,
  enrichAssignmentListItemMock,
  sendAssignmentNotificationEmailMock,
  formatDueDateMock,
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

describe('POST /api/assignments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'admin-1' }, email: 'admin@example.com' },
    })
    isAdminUserMock.mockReturnValue(true)
    createAssignmentMock.mockResolvedValue(createdAssignment)
    getAssignmentStatsMock.mockResolvedValue({ submitted: 0, total: 10 })
    enrichAssignmentListItemMock.mockImplementation((assignment, stats) => ({
      ...assignment,
      stats,
    }))
    formatDueDateMock.mockReturnValue('Aug 1, 2026')
    process.env.NEXT_PUBLIC_APP_URL = 'https://mentorbridge.in'
  })

  it('rejects non-admin callers before creating an assignment', async () => {
    isAdminUserMock.mockReturnValue(false)

    const response = await POST(
      new Request('http://localhost/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      }),
    )

    expect(response.status).toBe(403)
    expect(createAssignmentMock).not.toHaveBeenCalled()
  })

  it('keeps the created assignment when notification email fails', async () => {
    sendAssignmentNotificationEmailMock.mockRejectedValue(
      new Error('Resend unavailable'),
    )

    const response = await POST(
      new Request('http://localhost/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      }),
    )

    expect(createAssignmentMock).toHaveBeenCalled()
    expect(sendAssignmentNotificationEmailMock).toHaveBeenCalledWith({
      googleGroupId: 'group-1',
      title: 'Week 1 Lab',
      description: 'Build the API',
      dueDate: 'Aug 1, 2026',
      assignmentUrl: 'https://mentorbridge.in/secured/assignments/assignment-1',
      attachmentsUrl: null,
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      assignment: { id: 'assignment-1', stats: { submitted: 0, total: 10 } },
      emailSent: false,
      emailWarning: 'Resend unavailable',
    })
  })

  it('returns emailSent true when notification email succeeds', async () => {
    sendAssignmentNotificationEmailMock.mockResolvedValue({
      sentTo: 'group@googlegroups.com',
    })

    const response = await POST(
      new Request('http://localhost/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      emailSent: true,
    })
    const body = await response.clone().json()
    expect(body.emailWarning).toBeUndefined()
  })
})
