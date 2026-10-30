import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('next/cache', () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}))

import {
  getRepoFileContent,
  getRepoMetadata,
  getRepoReadme,
  getRepoTree,
} from './githubService'

const REPO_URL = 'https://github.com/org/demo'
const metaPayload = {
  name: 'demo',
  description: null,
  default_branch: 'main',
  stargazers_count: 0,
  private: false,
  html_url: 'https://github.com/org/demo',
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

describe('githubService edges', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    delete process.env.GITHUB_TOKEN
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('omits Authorization when no GitHub token is configured', async () => {
    fetchMock.mockResolvedValue(jsonResponse(metaPayload))

    await expect(getRepoMetadata(REPO_URL)).resolves.toMatchObject({
      description: '',
      stars: 0,
    })

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
    expect(headers.Accept).toBe('application/vnd.github+json')
  })

  it('treats a non-JSON 403 body as a private repository', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => {
        throw new Error('not json')
      },
    })

    await expect(getRepoMetadata(REPO_URL)).rejects.toThrow(
      'Repository is private or inaccessible.',
    )
  })

  it('returns an empty README when GitHub rate-limits the request', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: 'API rate limit exceeded' }, 403),
    )

    await expect(getRepoReadme(REPO_URL)).resolves.toEqual({
      content: '',
      path: 'README.md',
    })
  })

  it('defaults a missing README path and rejects an invalid repository URL', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        content: Buffer.from('# Hello', 'utf-8').toString('base64'),
      }),
    )

    await expect(getRepoReadme(REPO_URL)).resolves.toEqual({
      content: '# Hello',
      path: 'README.md',
    })

    fetchMock.mockClear()
    await expect(getRepoReadme('https://gitlab.com/org/demo')).rejects.toThrow(
      'Invalid GitHub repository URL.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('requests the repository root and defaults a missing file size to 0', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(metaPayload))
      .mockResolvedValueOnce(
        jsonResponse([{ name: 'README.md', path: 'README.md', type: 'file' }]),
      )

    await expect(getRepoTree(REPO_URL)).resolves.toEqual([
      { name: 'README.md', path: 'README.md', type: 'file', size: 0 },
    ])
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.github.com/repos/org/demo/contents?ref=main',
      expect.any(Object),
    )
  })

  it('rejects a supported path that GitHub does not return as a file', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(metaPayload))
      .mockResolvedValueOnce(
        jsonResponse({
          type: 'symlink',
          content: Buffer.from('target', 'utf-8').toString('base64'),
        }),
      )

    await expect(getRepoFileContent(REPO_URL, 'src/link.ts')).rejects.toThrow(
      'Path is not a file.',
    )

    fetchMock.mockClear()
    await expect(getRepoFileContent('not a url', 'src/app.ts')).rejects.toThrow(
      'Invalid GitHub repository URL.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
