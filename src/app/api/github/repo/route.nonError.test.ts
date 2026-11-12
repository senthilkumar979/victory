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
  getRepoFileContent: vi.fn(),
  getRepoMetadata: getRepoMetadataMock,
  getRepoReadme: vi.fn(),
  getRepoTree: vi.fn(),
}))

import { GET } from './route'

describe('GET /api/github/repo non-Error failures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'user@example.com' },
    })
  })

  it('hides a thrown non-Error behind the generic repo message', async () => {
    getRepoMetadataMock.mockRejectedValue({ token: 'ghp_secret' })

    const response = await GET(
      new Request('http://localhost/api/github/repo?url=https://github.com/org/demo'),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'Failed to load repo' })
    expect(JSON.stringify(body)).not.toContain('ghp_secret')
  })
})
