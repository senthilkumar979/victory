import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileAdminMock,
  getStudentAwardsMock,
  mobileErrorResponseMock,
} = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  getStudentAwardsMock: vi.fn(),
  mobileErrorResponseMock: vi.fn((err: unknown) =>
    Response.json(
      {
        error: err instanceof Error ? err.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 },
    ),
  ),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))

vi.mock('@/lib/mobile/studentService', () => ({
  getStudentAwards: getStudentAwardsMock,
}))

vi.mock('@/lib/mobile/mobileApiUtils', () => ({
  mobileErrorResponse: mobileErrorResponseMock,
}))

import { GET } from './route'

describe('GET /api/mobile/v1/admin/students/[id]/awards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('short-circuits before loading awards when admin auth fails', async () => {
    const unauthorized = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: unauthorized })

    const response = await GET(new Request('http://localhost/awards'), {
      params: Promise.resolve({ id: 'student-1' }),
    })

    expect(response).toBe(unauthorized)
    expect(getStudentAwardsMock).not.toHaveBeenCalled()
  })

  it('returns awards for the student id from the route params', async () => {
    getStudentAwardsMock.mockResolvedValue([
      { id: 'award-1', title: 'Top Performer', year: 2026 },
    ])

    const response = await GET(new Request('http://localhost/awards'), {
      params: Promise.resolve({ id: 'student-42' }),
    })

    expect(getStudentAwardsMock).toHaveBeenCalledWith('student-42')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'award-1', title: 'Top Performer', year: 2026 }],
    })
  })

  it('maps service failures through mobileErrorResponse', async () => {
    const failure = new Error('Could not load student awards.')
    getStudentAwardsMock.mockRejectedValue(failure)
    const mapped = Response.json(
      { error: 'Could not load student awards.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
    mobileErrorResponseMock.mockReturnValueOnce(mapped)

    const response = await GET(new Request('http://localhost/awards'), {
      params: Promise.resolve({ id: 'student-1' }),
    })

    expect(mobileErrorResponseMock).toHaveBeenCalledWith(failure)
    expect(response).toBe(mapped)
  })
})
