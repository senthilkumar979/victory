import { describe, expect, it } from 'vitest'

import { parseGitHubRepoUrl } from '@/lib/github/githubUtils'

describe('parseGitHubRepoUrl', () => {
  it('drops userinfo, query, hash, and one trailing .git suffix', () => {
    const parsed = parseGitHubRepoUrl(
      'https://user:token@github.com/org/my.repo.git?tab=readme#code',
    )

    expect(parsed).toEqual({ owner: 'org', repo: 'my.repo' })
    expect(JSON.stringify(parsed)).not.toContain('token')
  })

  it('accepts an http repository URL with a trailing slash', () => {
    expect(parseGitHubRepoUrl('http://github.com/org/repo/')).toEqual({
      owner: 'org',
      repo: 'repo',
    })
  })

  it('strips only a lowercase .git suffix', () => {
    expect(parseGitHubRepoUrl('https://github.com/org/repo.git.bak')).toEqual({
      owner: 'org',
      repo: 'repo.git.bak',
    })
    expect(parseGitHubRepoUrl('https://github.com/org/repo.GIT')).toEqual({
      owner: 'org',
      repo: 'repo.GIT',
    })
  })

  it('returns null when the URL cannot be parsed', () => {
    expect(parseGitHubRepoUrl('not a url')).toBeNull()
  })
})
