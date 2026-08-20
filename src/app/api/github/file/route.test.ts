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

describe('GET /api/github/file', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'user@example.com' },
    })
  })

  it('requires both url and path', async () => {
    const missingPath = await GET(
      new Request('http://localhost/api/github/file?url=https://github.com/org/demo'),
    )
    expect(missingPath.status).toBe(400)
    await expect(missingPath.json()).resolves.toEqual({
      error: 'url and path are required',
    })
    expect(getRepoFileContentMock).not.toHaveBeenCalled()
  })

  it('returns decoded file content for a valid preview path', async () => {
    getRepoFileContentMock.mockResolvedValue({
      path: 'src/index.ts',
      content: 'export {}',
      language: 'typescript',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/github/file?url=https://github.com/org/demo&path=src/index.ts',
      ),
    )

    expect(getRepoFileContentMock).toHaveBeenCalledWith(
      'https://github.com/org/demo',
      'src/index.ts',
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      file: {
        path: 'src/index.ts',
        content: 'export {}',
        language: 'typescript',
      },
    })
  })

  it('forwards unsupported file-type errors as 400', async () => {
    getRepoFileContentMock.mockRejectedValue(
      new Error('File type is not supported for preview.'),
    )

    const response = await GET(
      new Request(
        'http://localhost/api/github/file?url=https://github.com/org/demo&path=logo.png',
      ),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'File type is not supported for preview.',
    })
  })
})
