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

import { GET } from './route'

describe('GET /api/github/readme non-Error failures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'user@example.com' },
    })
  })

  it('hides a thrown non-Error behind the generic README message', async () => {
    getRepoReadmeMock.mockRejectedValue('readme body includes a token')

    const response = await GET(
      new Request(
        'http://localhost/api/github/readme?url=https://github.com/org/demo',
      ),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'Failed to load README' })
    expect(JSON.stringify(body)).not.toContain('token')
  })
})
