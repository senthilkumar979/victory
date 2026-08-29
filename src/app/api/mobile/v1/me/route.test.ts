import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileRequestMock,
  isAdminUserMock,
  getStudentForEmailMock,
} = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  getStudentForEmailMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))

vi.mock('@/lib/auth/clerkUser', () => ({
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/auth/requireAuth', () => ({
  getStudentForEmail: getStudentForEmailMock,
}))

import { GET } from './route'

const studentUser = {
  id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  imageUrl: 'https://img.example/ada.png',
  publicMetadata: { isAdmin: false },
}

const linkedStudent = {
  id: 'student-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  cohort_id: 'cohort-1',
  batch: '2026',
}

describe('GET /api/mobile/v1/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    authenticateMobileRequestMock.mockResolvedValue({
      user: studentUser,
      email: 'ada@example.com',
      userId: 'user-1',
    })
    isAdminUserMock.mockReturnValue(false)
    getStudentForEmailMock.mockResolvedValue(linkedStudent)
  })

  it('returns the auth error without looking up a student profile', async () => {
    const unauthorized = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileRequestMock.mockResolvedValue({ error: unauthorized })

    const response = await GET()

    expect(response).toBe(unauthorized)
    expect(getStudentForEmailMock).not.toHaveBeenCalled()
  })

  it('skips the student lookup for admins', async () => {
    isAdminUserMock.mockReturnValue(true)

    const response = await GET()

    expect(getStudentForEmailMock).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        imageUrl: 'https://img.example/ada.png',
        publicMetadata: { isAdmin: false },
      },
      isAdmin: true,
      linkedStudent: null,
    })
  })

  it('returns the linked student for authenticated members', async () => {
    const response = await GET()

    expect(getStudentForEmailMock).toHaveBeenCalledWith('ada@example.com')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        imageUrl: 'https://img.example/ada.png',
        publicMetadata: { isAdmin: false },
      },
      isAdmin: false,
      linkedStudent: {
        id: 'student-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        cohortId: 'cohort-1',
        batch: '2026',
      },
    })
  })

  it('keeps linkedStudent null when the profile lookup throws', async () => {
    getStudentForEmailMock.mockRejectedValue(new Error('timeout'))

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      isAdmin: false,
      linkedStudent: null,
    })
  })

  it('maps unexpected failures to INTERNAL_ERROR', async () => {
    authenticateMobileRequestMock.mockRejectedValue(new Error('clerk down'))

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: 'clerk down',
    })
  })
})
