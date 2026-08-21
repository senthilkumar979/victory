import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  requireAuthMock,
  isAdminUserMock,
  deleteAssignmentMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  deleteAssignmentMock: vi.fn(),
}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
  getStudentForEmail: vi.fn(),
}))

vi.mock('@/lib/auth/clerkUser', () => ({
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/assignments/assignmentService', () => ({
  deleteAssignment: deleteAssignmentMock,
  enrichAssignmentListItem: vi.fn(),
  getAssignmentById: vi.fn(),
  getAssignmentStats: vi.fn(),
  getSubmissionForStudent: vi.fn(),
  listSubmissionsForAssignment: vi.fn(),
  updateAssignment: vi.fn(),
}))

vi.mock('@/lib/assignments/assignmentEmail', () => ({
  sendAssignmentNotificationEmail: vi.fn(),
}))

vi.mock('@/lib/assignments/assignmentUtils', () => ({
  formatDueDate: vi.fn(),
}))

import { NextResponse } from 'next/server'

import { DELETE } from './route'

describe('DELETE /api/assignments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'admin-1' }, email: 'admin@example.com' },
    })
    isAdminUserMock.mockReturnValue(true)
    deleteAssignmentMock.mockResolvedValue(undefined)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns the auth failure response without deleting', async () => {
    requireAuthMock.mockResolvedValue({
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await DELETE(
      new Request('http://localhost/api/assignments/assignment-1', {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: 'assignment-1' }) },
    )

    expect(response.status).toBe(401)
    expect(deleteAssignmentMock).not.toHaveBeenCalled()
  })

  it('rejects non-admin callers before deleting an assignment', async () => {
    isAdminUserMock.mockReturnValue(false)

    const response = await DELETE(
      new Request('http://localhost/api/assignments/assignment-1', {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: 'assignment-1' }) },
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
    expect(deleteAssignmentMock).not.toHaveBeenCalled()
  })

  it('deletes the assignment for admins', async () => {
    const response = await DELETE(
      new Request('http://localhost/api/assignments/assignment-1', {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: 'assignment-1' }) },
    )

    expect(deleteAssignmentMock).toHaveBeenCalledWith('assignment-1')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
  })

  it('maps delete failures to 500 without leaking internals', async () => {
    deleteAssignmentMock.mockRejectedValue(new Error('fk constraint'))

    const response = await DELETE(
      new Request('http://localhost/api/assignments/assignment-1', {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: 'assignment-1' }) },
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not delete assignment.',
    })
  })
})
