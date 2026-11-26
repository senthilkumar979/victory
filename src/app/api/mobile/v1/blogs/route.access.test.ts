import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextResponse } from 'next/server'

const { authenticateMobileRequestMock, listTableRowsMock } = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  listTableRowsMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: null }))
vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))
vi.mock('@/lib/mobile/adminCrudService', () => ({
  listTableRows: listTableRowsMock,
}))

import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

import { GET } from './route'

const member = {
  user: { id: 'student-user' },
  email: 'student@example.com',
  userId: 'student-user',
}

function blogsRequest(query = '') {
  return new Request(`http://localhost:3001/api/mobile/v1/blogs${query}`)
}

describe('GET /api/mobile/v1/blogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    authenticateMobileRequestMock.mockResolvedValue(member)
    listTableRowsMock.mockResolvedValue({ data: [], pagination: { page: 1 } })
  })

  it('lets an authenticated student read the default blog page', async () => {
    const response = await GET(blogsRequest())

    expect(response.status).toBe(200)
    expect(listTableRowsMock).toHaveBeenCalledWith('blogs', '*', 1, 20, 'id', false)
  })

  it('returns the auth error without listing blogs', async () => {
    const error = NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileRequestMock.mockResolvedValue({ error })

    const response = await GET(blogsRequest())

    expect(response).toBe(error)
    expect(listTableRowsMock).not.toHaveBeenCalled()
  })

  it('caps a requested limit of 250 before querying', async () => {
    await GET(blogsRequest('?page=4&limit=250'))

    expect(listTableRowsMock).toHaveBeenCalledWith('blogs', '*', 4, 100, 'id', false)
  })

  it('preserves a mobile service error and empty details', async () => {
    listTableRowsMock.mockRejectedValue(
      new MobileServiceError('Could not load blogs.', 503, 'SERVICE_UNAVAILABLE'),
    )

    const response = await GET(blogsRequest())

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load blogs.',
      code: 'SERVICE_UNAVAILABLE',
      details: {},
    })
  })

  it('hides database errors from the response body', async () => {
    listTableRowsMock.mockRejectedValue(
      new Error('relation "blogs" does not exist'),
    )

    const response = await GET(blogsRequest())
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(JSON.stringify(body)).not.toContain('relation')
  })
})
