import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAuthMock, getRepoReadmeMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getRepoReadmeMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
}))

vi.mock('@/lib/github/githubService', () => ({
  getRepoReadme: getRepoReadmeMock,
}))

import { NextResponse } from 'next/server'

import { GET } from './route'

describe('GET /api/github/readme', () => {
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

    const response = await GET(new Request('http://localhost/api/github/readme'))

    expect(response.status).toBe(401)
    expect(getRepoReadmeMock).not.toHaveBeenCalled()
  })

  it('requires a url query param', async () => {
    const response = await GET(new Request('http://localhost/api/github/readme'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'url is required' })
    expect(getRepoReadmeMock).not.toHaveBeenCalled()
  })

  it('returns the README payload for an authenticated caller', async () => {
    getRepoReadmeMock.mockResolvedValue({ content: '# Demo', path: 'README.md' })

    const response = await GET(
      new Request(
        'http://localhost/api/github/readme?url=https://github.com/org/demo',
      ),
    )

    expect(getRepoReadmeMock).toHaveBeenCalledWith('https://github.com/org/demo')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      content: '# Demo',
      path: 'README.md',
    })
  })

  it('maps service errors to 400', async () => {
    getRepoReadmeMock.mockRejectedValue(new Error('Invalid GitHub repository URL.'))

    const response = await GET(
      new Request(
        'http://localhost/api/github/readme?url=https://example.com/not-github',
      ),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid GitHub repository URL.',
    })
  })
})
