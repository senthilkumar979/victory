import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAuthMock, getRepoMetadataMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getRepoMetadataMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
}))

vi.mock('@/lib/github/githubService', () => ({
  getRepoMetadata: getRepoMetadataMock,
  getRepoFileContent: vi.fn(),
  getRepoReadme: vi.fn(),
  getRepoTree: vi.fn(),
}))

import { NextResponse } from 'next/server'

import { GET } from './route'

describe('GET /api/github/repo', () => {
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

    const response = await GET(new Request('http://localhost/api/github/repo'))

    expect(response.status).toBe(401)
    expect(getRepoMetadataMock).not.toHaveBeenCalled()
  })

  it('requires a url query param', async () => {
    const response = await GET(new Request('http://localhost/api/github/repo'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'url is required' })
    expect(getRepoMetadataMock).not.toHaveBeenCalled()
  })

  it('returns metadata for an authenticated caller', async () => {
    getRepoMetadataMock.mockResolvedValue({ owner: 'org', repo: 'demo' })

    const response = await GET(
      new Request('http://localhost/api/github/repo?url=https://github.com/org/demo'),
    )

    expect(getRepoMetadataMock).toHaveBeenCalledWith(
      'https://github.com/org/demo',
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      meta: { owner: 'org', repo: 'demo' },
    })
  })

  it('forwards GitHub service errors as 400', async () => {
    getRepoMetadataMock.mockRejectedValue(
      new Error('GitHub API rate limit exceeded. Try again later.'),
    )

    const response = await GET(
      new Request('http://localhost/api/github/repo?url=https://github.com/org/demo'),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'GitHub API rate limit exceeded. Try again later.',
    })
  })
})
