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
  description: 'A demo repo',
  default_branch: 'main',
  stargazers_count: 12,
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

describe('githubService', () => {
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

  it('rejects invalid repository URLs before calling GitHub', async () => {
    await expect(getRepoMetadata('https://gitlab.com/org/demo')).rejects.toThrow(
      'Invalid GitHub repository URL.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends a bearer token and maps repository metadata', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'gh-secret')
    fetchMock.mockResolvedValue(jsonResponse(metaPayload))

    await expect(getRepoMetadata(REPO_URL)).resolves.toEqual({
      owner: 'org',
      repo: 'demo',
      name: 'demo',
      description: 'A demo repo',
      defaultBranch: 'main',
      stars: 12,
      isPrivate: false,
      htmlUrl: 'https://github.com/org/demo',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/org/demo',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer gh-secret',
          Accept: 'application/vnd.github+json',
        }),
      }),
    )
  })

  it('maps GitHub 403 rate-limit and private-repo failures', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'API rate limit exceeded' }, 403),
    )
    await expect(getRepoMetadata(REPO_URL)).rejects.toThrow(
      'GitHub API rate limit exceeded. Try again later.',
    )

    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Not allowed' }, 403))
    await expect(getRepoMetadata(REPO_URL)).rejects.toThrow(
      'Repository is private or inaccessible.',
    )
  })

  it('maps 404 and other GitHub failures', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 404))
    await expect(getRepoMetadata(REPO_URL)).rejects.toThrow(
      'Repository not found.',
    )

    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500))
    await expect(getRepoMetadata(REPO_URL)).rejects.toThrow(
      'Failed to load GitHub repository.',
    )
  })

  it('returns an empty README when GitHub fails instead of throwing', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 404))

    await expect(getRepoReadme(REPO_URL)).resolves.toEqual({
      content: '',
      path: 'README.md',
    })
  })

  it('decodes README content and lists tree entries for a path', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          content: Buffer.from('# Hello', 'utf-8').toString('base64'),
          path: 'docs/README.md',
        }),
      )
      .mockResolvedValueOnce(jsonResponse(metaPayload))
      .mockResolvedValueOnce(
        jsonResponse([
          { name: 'src', path: 'src', type: 'dir', size: 0 },
          { name: 'app.ts', path: 'src/app.ts', type: 'file', size: 20 },
        ]),
      )
      .mockResolvedValueOnce(jsonResponse(metaPayload))
      .mockResolvedValueOnce(jsonResponse({ type: 'file' }))

    await expect(getRepoReadme(REPO_URL)).resolves.toEqual({
      content: '# Hello',
      path: 'docs/README.md',
    })
    await expect(getRepoTree(REPO_URL, 'src')).resolves.toEqual([
      { name: 'src', path: 'src', type: 'dir', size: 0 },
      { name: 'app.ts', path: 'src/app.ts', type: 'file', size: 20 },
    ])
    await expect(getRepoTree(REPO_URL, 'README.md')).resolves.toEqual([])
  })

  it('rejects unsupported or non-file preview paths', async () => {
    await expect(getRepoFileContent(REPO_URL, 'logo.png')).rejects.toThrow(
      'File type is not supported for preview.',
    )
    expect(fetchMock).not.toHaveBeenCalled()

    fetchMock
      .mockResolvedValueOnce(jsonResponse(metaPayload))
      .mockResolvedValueOnce(jsonResponse([{ name: 'src', type: 'dir' }]))

    await expect(getRepoFileContent(REPO_URL, 'src/index.ts')).rejects.toThrow(
      'Path is not a file.',
    )
  })

  it('decodes file content and maps the Monaco language', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(metaPayload))
      .mockResolvedValueOnce(
        jsonResponse({
          type: 'file',
          content: Buffer.from('export const n = 1', 'utf-8').toString('base64'),
        }),
      )

    await expect(getRepoFileContent(REPO_URL, 'src/index.ts')).resolves.toEqual({
      path: 'src/index.ts',
      content: 'export const n = 1',
      language: 'typescript',
    })
  })
})
