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
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

describe('GET /api/mobile/v1/blogs failure guards', () => {
  beforeEach(() => {
    authenticateMobileRequestMock.mockReset()
    listTableRowsMock.mockReset()
    authenticateMobileRequestMock.mockResolvedValue({
      user: { id: 'student-1' },
      email: 'student@example.com',
      userId: 'student-1',
    })
    listTableRowsMock.mockResolvedValue({ data: [], pagination: { page: 1 } })
  })

  it('uses the shared page and limit defaults instead of the table default', async () => {
    const response = await GET(
      new Request('http://localhost/api/mobile/v1/blogs'),
    )

    expect(response.status).toBe(200)
    expect(listTableRowsMock).toHaveBeenCalledWith(
      'blogs',
      '*',
      1,
      20,
      'id',
      false,
    )
  })

  it('caps an oversized limit before querying blogs', async () => {
    await GET(new Request('http://localhost/api/mobile/v1/blogs?page=4&limit=250'))

    expect(listTableRowsMock).toHaveBeenCalledWith(
      'blogs',
      '*',
      4,
      100,
      'id',
      false,
    )
  })

  it('returns the blog service status and code', async () => {
    listTableRowsMock.mockRejectedValue(
      new MobileServiceError('Could not load blogs.', 503, 'SERVICE_UNAVAILABLE'),
    )

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/blogs'),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load blogs.',
      code: 'SERVICE_UNAVAILABLE',
      details: {},
    })
  })

  it('hides unexpected failures behind a generic 500', async () => {
    listTableRowsMock.mockRejectedValue(new Error('relation "blogs" does not exist'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/blogs'),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(JSON.stringify(body)).not.toContain('relation')
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
