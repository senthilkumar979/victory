import { describe, expect, it } from 'vitest'

import {
  getMonacoLanguage,
  isSupportedMonacoPath,
  parseGitHubRepoUrl,
} from './githubUtils'

describe('parseGitHubRepoUrl', () => {
  it('parses owner/repo from common GitHub URL shapes', () => {
    expect(parseGitHubRepoUrl('https://github.com/org/repo')).toEqual({
      owner: 'org',
      repo: 'repo',
    })
    expect(parseGitHubRepoUrl('https://www.github.com/org/repo.git')).toEqual({
      owner: 'org',
      repo: 'repo',
    })
    expect(
      parseGitHubRepoUrl('  https://github.com/org/repo/tree/main  '),
    ).toEqual({
      owner: 'org',
      repo: 'repo',
    })
  })

  it('rejects non-GitHub hosts, incomplete paths, and invalid URLs', () => {
    expect(parseGitHubRepoUrl('https://gitlab.com/org/repo')).toBeNull()
    expect(parseGitHubRepoUrl('https://github.com/only-owner')).toBeNull()
    expect(parseGitHubRepoUrl('not a url')).toBeNull()
    expect(parseGitHubRepoUrl('')).toBeNull()
  })
})

describe('Monaco path helpers', () => {
  it('maps supported extensions and falls back to plaintext', () => {
    expect(getMonacoLanguage('src/App.tsx')).toBe('typescript')
    expect(getMonacoLanguage('README.md')).toBe('markdown')
    expect(getMonacoLanguage('notes.txt')).toBe('plaintext')
    expect(isSupportedMonacoPath('src/utils.ts')).toBe(true)
    expect(isSupportedMonacoPath('image.png')).toBe(false)
  })
})
