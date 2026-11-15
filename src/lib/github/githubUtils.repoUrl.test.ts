import { describe, expect, it } from 'vitest'

import { parseGitHubRepoUrl } from './githubUtils'

describe('parseGitHubRepoUrl repository identity', () => {
  it('ignores query, hash, and userinfo and strips one trailing .git', () => {
    expect(
      parseGitHubRepoUrl(
        'https://user:token@github.com/org/my.repo.git?tab=readme#code',
      ),
    ).toEqual({ owner: 'org', repo: 'my.repo' })
  })

  it('accepts http and keeps a .git suffix that is not at the end of the name', () => {
    expect(parseGitHubRepoUrl('http://github.com/org/repo/')).toEqual({
      owner: 'org',
      repo: 'repo',
    })
    expect(parseGitHubRepoUrl('https://github.com/org/repo.git.bak')).toEqual({
      owner: 'org',
      repo: 'repo.git.bak',
    })
    expect(parseGitHubRepoUrl('https://github.com/org/repo.GIT')).toEqual({
      owner: 'org',
      repo: 'repo.GIT',
    })
  })
})
