import 'server-only'

import { unstable_cache } from 'next/cache'

import {
  getMonacoLanguage,
  isSupportedMonacoPath,
  parseGitHubRepoUrl,
} from '@/lib/github/githubUtils'

const GITHUB_API = 'https://api.github.com'

async function githubFetch(path: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${GITHUB_API}${path}`, {
    headers,
    next: { revalidate: 900 },
  })

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}))
    if ((body as { message?: string }).message?.includes('rate limit')) {
      throw new Error('GitHub API rate limit exceeded. Try again later.')
    }
    throw new Error('Repository is private or inaccessible.')
  }

  if (res.status === 404) {
    throw new Error('Repository not found.')
  }

  if (!res.ok) {
    throw new Error('Failed to load GitHub repository.')
  }

  return res.json()
}

export const getRepoMetadata = unstable_cache(
  async (repoUrl: string) => {
    const parsed = parseGitHubRepoUrl(repoUrl)
    if (!parsed) throw new Error('Invalid GitHub repository URL.')

    const data = await githubFetch(`/repos/${parsed.owner}/${parsed.repo}`)
    return {
      owner: parsed.owner,
      repo: parsed.repo,
      name: data.name as string,
      description: (data.description as string | null) ?? '',
      defaultBranch: data.default_branch as string,
      stars: data.stargazers_count as number,
      isPrivate: data.private as boolean,
      htmlUrl: data.html_url as string,
    }
  },
  ['github-repo-meta'],
  { revalidate: 900 },
)

export const getRepoReadme = unstable_cache(
  async (repoUrl: string) => {
    const parsed = parseGitHubRepoUrl(repoUrl)
    if (!parsed) throw new Error('Invalid GitHub repository URL.')

    try {
      const data = await githubFetch(
        `/repos/${parsed.owner}/${parsed.repo}/readme`,
      )
      const content = Buffer.from(data.content as string, 'base64').toString(
        'utf-8',
      )
      return { content, path: (data.path as string) ?? 'README.md' }
    } catch {
      return { content: '', path: 'README.md' }
    }
  },
  ['github-repo-readme'],
  { revalidate: 900 },
)

export async function getRepoTree(repoUrl: string, path = '') {
  const meta = await getRepoMetadata(repoUrl)
  const branch = meta.defaultBranch
  const treePath = path ? `/${path}` : ''
  const data = await githubFetch(
    `/repos/${meta.owner}/${meta.repo}/contents${treePath}?ref=${branch}`,
  )

  if (!Array.isArray(data)) {
    return []
  }

  return data.map((item: Record<string, unknown>) => ({
    name: item.name as string,
    path: item.path as string,
    type: item.type as 'file' | 'dir',
    size: (item.size as number) ?? 0,
  }))
}

export async function getRepoFileContent(repoUrl: string, path: string) {
  if (!isSupportedMonacoPath(path)) {
    throw new Error('File type is not supported for preview.')
  }

  const meta = await getRepoMetadata(repoUrl)
  const data = await githubFetch(
    `/repos/${meta.owner}/${meta.repo}/contents/${path}?ref=${meta.defaultBranch}`,
  )

  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error('Path is not a file.')
  }

  const content = Buffer.from(data.content as string, 'base64').toString('utf-8')
  return {
    path,
    content,
    language: getMonacoLanguage(path),
  }
}
