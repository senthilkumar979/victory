import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextResponse } from 'next/server'

import { GET, POST } from './route'

const {
  getAssignmentByIdMock,
  getStudentForEmailMock,
  isAdminUserMock,
  requireAuthMock,
  upsertSubmissionMock,
} = vi.hoisted(() => ({
  getAssignmentByIdMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  requireAuthMock: vi.fn(),
  upsertSubmissionMock: vi.fn(),
}))

vi.mock('@/lib/assignments/assignmentService', () => ({
  getAssignmentById: getAssignmentByIdMock,
  getSubmissionForStudent: vi.fn(),
  upsertSubmission: upsertSubmissionMock,
}))

vi.mock('@/lib/auth/clerkUser', () => ({
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
  getStudentForEmail: getStudentForEmailMock,
}))

const due = '2026-06-10T12:00:00.000Z'
const dueMs = new Date(due).getTime()
const docUrl = 'https://docs.google.com/document/d/abc123'

function postSubmission(
  body: Record<string, unknown> = {
    googleDocUrl: docUrl,
    githubRepoUrl: '',
  },
) {
  return POST(
    new Request('http://localhost/api/assignments/assignment-1/my-submission', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: 'assignment-1' }) },
  )
}

describe('assignment submission access', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(dueMs)
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'ada@example.com' },
    })
    isAdminUserMock.mockReturnValue(false)
    getAssignmentByIdMock.mockResolvedValue({
      id: 'assignment-1',
      cohortId: 'cohort-1',
      dueDate: due,
    })
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-1',
      cohort_id: 'cohort-1',
    })
    upsertSubmissionMock.mockResolvedValue({ id: 'submission-1' })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stops at an auth failure before loading the assignment', async () => {
    requireAuthMock.mockResolvedValue({
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await postSubmission()

    expect(response.status).toBe(401)
    expect(getAssignmentByIdMock).not.toHaveBeenCalled()
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })

  it('rejects a matching student one millisecond after the due instant', async () => {
    vi.setSystemTime(dueMs + 1)

    const response = await postSubmission()

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      error: 'Submission deadline has passed.',
    })
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })

  it('accepts a matching student at the exact due instant', async () => {
    const response = await postSubmission()

    expect(response.status).toBe(200)
    expect(upsertSubmissionMock).toHaveBeenCalledWith({
      assignmentId: 'assignment-1',
      studentId: 'student-1',
      googleDocUrl: docUrl,
      githubRepoUrl: '',
    })
  })

  it('lets an admin submit for another student after the deadline and outside the cohort', async () => {
    vi.setSystemTime(dueMs + 1)
    isAdminUserMock.mockReturnValue(true)
    getStudentForEmailMock.mockResolvedValue({
      id: 'admin-student',
      cohort_id: 'other-cohort',
    })

    const response = await postSubmission({
      googleDocUrl: docUrl,
      githubRepoUrl: '',
      studentId: 'student-9',
    })

    expect(response.status).toBe(200)
    expect(upsertSubmissionMock).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'student-9' }),
    )
  })

  it('blocks a student from another cohort while the deadline is still open', async () => {
    getStudentForEmailMock.mockResolvedValue({
      id: 'student-1',
      cohort_id: 'other-cohort',
    })

    const response = await postSubmission()

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })

  it('ignores a student id supplied by a non-admin', async () => {
    const response = await postSubmission({
      googleDocUrl: docUrl,
      githubRepoUrl: '',
      studentId: 'student-9',
    })

    expect(response.status).toBe(200)
    expect(upsertSubmissionMock).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'student-1' }),
    )
  })

  it('requires a Google Doc or GitHub URL before writing', async () => {
    const response = await postSubmission({
      googleDocUrl: 'https://example.com/not-a-doc',
      githubRepoUrl: '',
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Enter a valid Google Docs URL',
    })
    expect(upsertSubmissionMock).not.toHaveBeenCalled()
  })

  it('hides internal errors on read and keeps Error messages on save', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    getAssignmentByIdMock.mockRejectedValue(
      new Error('relation "assignments" does not exist'),
    )

    const read = await GET(
      new Request(
        'http://localhost/api/assignments/assignment-1/my-submission',
      ),
      { params: Promise.resolve({ id: 'assignment-1' }) },
    )

    expect(read.status).toBe(500)
    await expect(read.json()).resolves.toEqual({
      error: 'Could not load submission.',
    })

    getAssignmentByIdMock.mockResolvedValue({
      id: 'assignment-1',
      cohortId: 'cohort-1',
      dueDate: due,
    })
    upsertSubmissionMock.mockRejectedValueOnce(
      new Error('relation "assignments" does not exist'),
    )
    const save = await postSubmission()
    expect(save.status).toBe(500)
    await expect(save.json()).resolves.toEqual({
      error: 'relation "assignments" does not exist',
    })

    upsertSubmissionMock.mockRejectedValueOnce('socket hang up')
    const unknown = await postSubmission()
    expect(unknown.status).toBe(500)
    await expect(unknown.json()).resolves.toEqual({
      error: 'Could not save submission.',
    })
    expect(consoleError).toHaveBeenCalled()
  })
})
