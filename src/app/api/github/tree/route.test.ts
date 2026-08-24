import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAuthMock, getRepoTreeMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getRepoTreeMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
}))

vi.mock('@/lib/github/githubService', () => ({
  getRepoTree: getRepoTreeMock,
}))

import { NextResponse } from 'next/server'

import { GET } from './route'

describe('GET /api/github/tree', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'user@example.com' },
    })
  })

  it('forwards unauthorized responses before reading query params', async () => {
    requireAuthMock.mockResolvedValue({
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await GET(new Request('http://localhost/api/github/tree'))

    expect(response.status).toBe(401)
    expect(getRepoTreeMock).not.toHaveBeenCalled()
  })

  it('requires a url query param', async () => {
    const response = await GET(new Request('http://localhost/api/github/tree'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'url is required' })
    expect(getRepoTreeMock).not.toHaveBeenCalled()
  })

  it('forwards url and path to getRepoTree', async () => {
    getRepoTreeMock.mockResolvedValue([{ name: 'src', type: 'dir' }])

    const response = await GET(
      new Request(
        'http://localhost/api/github/tree?url=https://github.com/org/demo&path=src',
      ),
    )

    expect(getRepoTreeMock).toHaveBeenCalledWith(
      'https://github.com/org/demo',
      'src',
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      tree: [{ name: 'src', type: 'dir' }],
    })
  })

  it('defaults path to an empty string and maps service errors to 400', async () => {
    getRepoTreeMock.mockRejectedValue(new Error('Repository not found.'))

    const response = await GET(
      new Request('http://localhost/api/github/tree?url=https://github.com/org/demo'),
    )

    expect(getRepoTreeMock).toHaveBeenCalledWith(
      'https://github.com/org/demo',
      '',
    )
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Repository not found.',
    })
  })
})
