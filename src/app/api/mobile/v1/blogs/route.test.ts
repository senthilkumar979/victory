import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { authenticateMobileRequestMock, listTableRowsMock } = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  listTableRowsMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))

vi.mock('@/lib/mobile/adminCrudService', () => ({
  listTableRows: listTableRowsMock,
}))

import { GET } from './route'

describe('GET /api/mobile/v1/blogs', () => {
  beforeEach(() => {
    authenticateMobileRequestMock.mockReset()
    listTableRowsMock.mockReset()
  })

  it('returns the auth failure without querying blogs', async () => {
    const authError = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileRequestMock.mockResolvedValue({ error: authError })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/blogs'),
    )

    expect(response).toBe(authError)
    expect(listTableRowsMock).not.toHaveBeenCalled()
  })

  it('allows an authenticated member to read a paginated blog list', async () => {
    authenticateMobileRequestMock.mockResolvedValue({
      user: { id: 'student-1' },
      email: 'student@example.com',
      userId: 'student-1',
    })
    listTableRowsMock.mockResolvedValue({
      data: [{ id: 7, title: 'Testing matters' }],
      pagination: { page: 2, limit: 5, totalCount: 1 },
    })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/blogs?page=2&limit=5'),
    )

    expect(response.status).toBe(200)
    expect(listTableRowsMock).toHaveBeenCalledWith(
      'blogs',
      '*',
      2,
      5,
      'id',
      false,
    )
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 7, title: 'Testing matters' }],
      pagination: { page: 2, limit: 5, totalCount: 1 },
    })
  })
})
