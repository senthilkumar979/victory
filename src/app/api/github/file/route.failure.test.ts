import { NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAuthMock, getRepoFileContentMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getRepoFileContentMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
}))

vi.mock('@/lib/github/githubService', () => ({
  getRepoFileContent: getRepoFileContentMock,
}))

import { GET } from './route'

const previewUrl =
  'http://localhost/api/github/file?url=https://github.com/org/demo&path=src/index.ts'

describe('GET /api/github/file failure guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'user@example.com' },
    })
  })

  it('returns the auth response before reading the file', async () => {
    const unauthorized = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    )
    requireAuthMock.mockResolvedValue({ response: unauthorized })

    const response = await GET(new Request(previewUrl))

    expect(response).toBe(unauthorized)
    expect(getRepoFileContentMock).not.toHaveBeenCalled()
  })

  it('rejects an empty url even when a path is present', async () => {
    const response = await GET(
      new Request('http://localhost/api/github/file?url=&path=src/index.ts'),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'url and path are required',
    })
    expect(getRepoFileContentMock).not.toHaveBeenCalled()
  })

  it('hides non-Error failures behind a generic message', async () => {
    getRepoFileContentMock.mockRejectedValue('private token leaked')

    const response = await GET(new Request(previewUrl))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'Failed to load file' })
    expect(JSON.stringify(body)).not.toContain('private token')
  })
})
