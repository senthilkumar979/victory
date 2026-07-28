import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileAdminMock,
  getStudentFilterOptionsMock,
  mobileErrorResponseMock,
} = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  getStudentFilterOptionsMock: vi.fn(),
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
  getStudentFilterOptions: getStudentFilterOptionsMock,
}))

vi.mock('@/lib/mobile/mobileApiUtils', () => ({
  mobileErrorResponse: mobileErrorResponseMock,
}))

import { GET } from './route'

describe('GET /api/mobile/v1/admin/students/filter-options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('short-circuits before loading filter options when admin auth fails', async () => {
    const unauthorized = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: unauthorized })

    const response = await GET()

    expect(response).toBe(unauthorized)
    expect(getStudentFilterOptionsMock).not.toHaveBeenCalled()
  })

  it('returns filter options for an authenticated admin', async () => {
    getStudentFilterOptionsMock.mockResolvedValue({
      cohorts: [{ id: 'cohort-1', name: 'Batch 2026' }],
      companies: ['Acme'],
      roles: ['Engineer'],
    })

    const response = await GET()

    expect(getStudentFilterOptionsMock).toHaveBeenCalledOnce()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: {
        cohorts: [{ id: 'cohort-1', name: 'Batch 2026' }],
        companies: ['Acme'],
        roles: ['Engineer'],
      },
    })
  })

  it('maps service failures through mobileErrorResponse', async () => {
    const failure = new Error('Could not load filter options.')
    getStudentFilterOptionsMock.mockRejectedValue(failure)
    const mapped = Response.json(
      { error: 'Could not load filter options.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
    mobileErrorResponseMock.mockReturnValueOnce(mapped)

    const response = await GET()

    expect(mobileErrorResponseMock).toHaveBeenCalledWith(failure)
    expect(response).toBe(mapped)
  })
})
