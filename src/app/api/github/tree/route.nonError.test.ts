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

import { GET } from './route'

describe('GET /api/github/tree non-Error failures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'user@example.com' },
    })
  })

  it('hides a thrown non-Error behind the generic tree message', async () => {
    getRepoTreeMock.mockRejectedValue('tree includes .env')

    const response = await GET(
      new Request(
        'http://localhost/api/github/tree?url=https://github.com/org/demo&path=src',
      ),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'Failed to load tree' })
    expect(JSON.stringify(body)).not.toContain('.env')
  })
})
