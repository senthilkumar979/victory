import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileAdminMock,
  getStudentRoadmapProgressMock,
  mobileErrorResponseMock,
} = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  getStudentRoadmapProgressMock: vi.fn(),
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
  getStudentRoadmapProgress: getStudentRoadmapProgressMock,
}))

vi.mock('@/lib/mobile/mobileApiUtils', () => ({
  mobileErrorResponse: mobileErrorResponseMock,
}))

import { GET } from './route'

describe('GET /api/mobile/v1/admin/students/[id]/roadmap-progress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('short-circuits before loading progress when admin auth fails', async () => {
    const unauthorized = Response.json(
      { error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: unauthorized })

    const response = await GET(new Request('http://localhost/roadmap'), {
      params: Promise.resolve({ id: 'student-1' }),
    })

    expect(response).toBe(unauthorized)
    expect(getStudentRoadmapProgressMock).not.toHaveBeenCalled()
  })

  it('returns roadmap progress for the student id from the route params', async () => {
    getStudentRoadmapProgressMock.mockResolvedValue([
      { id: 'progress-1', node_id: 'node-a', completed_at: '2026-07-01' },
    ])

    const response = await GET(new Request('http://localhost/roadmap'), {
      params: Promise.resolve({ id: 'student-99' }),
    })

    expect(getStudentRoadmapProgressMock).toHaveBeenCalledWith('student-99')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: [
        { id: 'progress-1', node_id: 'node-a', completed_at: '2026-07-01' },
      ],
    })
  })

  it('maps service failures through mobileErrorResponse', async () => {
    const failure = new Error('Could not load roadmap progress.')
    getStudentRoadmapProgressMock.mockRejectedValue(failure)

    const response = await GET(new Request('http://localhost/roadmap'), {
      params: Promise.resolve({ id: 'student-1' }),
    })

    expect(mobileErrorResponseMock).toHaveBeenCalledWith(failure)
    expect(response.status).toBe(500)
  })
})
