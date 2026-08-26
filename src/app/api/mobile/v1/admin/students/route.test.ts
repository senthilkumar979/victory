import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { authenticateMobileAdminMock, listStudentsMock } = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  listStudentsMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))

vi.mock('@/lib/mobile/studentService', () => ({
  listStudents: listStudentsMock,
}))

import { GET } from './route'

describe('GET /api/mobile/v1/admin/students', () => {
  beforeEach(() => {
    authenticateMobileAdminMock.mockReset()
    listStudentsMock.mockReset()
  })

  it('does not query students when the caller is not an admin', async () => {
    const forbidden = Response.json(
      { error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: forbidden })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/admin/students?search=ada'),
    )

    expect(response).toBe(forbidden)
    expect(listStudentsMock).not.toHaveBeenCalled()
  })

  it('forwards pagination and directory filters', async () => {
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    listStudentsMock.mockResolvedValue({
      data: [{ id: 's1', name: 'Ada' }],
      pagination: { page: 2, limit: 10, totalCount: 1 },
    })

    const response = await GET(
      new Request(
        'http://localhost/api/mobile/v1/admin/students?page=2&limit=10&search=Ada&cohort=c1&company=Codifi&role=Engineer',
      ),
    )

    expect(listStudentsMock).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      search: 'Ada',
      cohort: 'c1',
      company: 'Codifi',
      role: 'Engineer',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 's1', name: 'Ada' }],
      pagination: { page: 2, limit: 10, totalCount: 1 },
    })
  })

  it('omits missing filters instead of sending empty strings', async () => {
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    listStudentsMock.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, totalCount: 0 },
    })

    await GET(new Request('http://localhost/api/mobile/v1/admin/students'))

    expect(listStudentsMock).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      cohort: undefined,
      company: undefined,
      role: undefined,
    })
  })
})
