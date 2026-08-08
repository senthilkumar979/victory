import { describe, expect, it } from 'vitest'

import {
  isExcludedFromGlobalLoader,
  pathnameOnly,
  shouldShowLoaderForUrl,
} from './loaderFetchHeuristics'

describe('pathnameOnly', () => {
  it('normalizes relative and absolute URLs to pathnames', () => {
    expect(pathnameOnly('/students?tab=profile#top')).toBe('/students')
    expect(pathnameOnly('https://example.com/api/add-blog?x=1')).toBe(
      '/api/add-blog',
    )
  })

  it('returns an empty string for malformed absolute URLs', () => {
    expect(pathnameOnly('https://')).toBe('')
  })
})

describe('isExcludedFromGlobalLoader', () => {
  it('excludes visitor chat requests handled by inline UI', () => {
    expect(isExcludedFromGlobalLoader('/api/visitor-chat')).toBe(true)
    expect(isExcludedFromGlobalLoader('/api/visitor-chat/')).toBe(true)
  })
})

describe('shouldShowLoaderForUrl', () => {
  it.each(['/students', '/_next/static/chunk.js', '/logo.png?width=64'])(
    'does not show the global loader for %s',
    (url) => {
      expect(shouldShowLoaderForUrl(url)).toBe(false)
    },
  )

  it.each([
    '/api/add-blog',
    'https://example.com/api/foo',
    'https://project.supabase.co/rest/v1/students',
  ])('shows the global loader for data fetch %s', (url) => {
    expect(shouldShowLoaderForUrl(url)).toBe(true)
  })

  it('does not show the global loader for visitor chat requests', () => {
    expect(shouldShowLoaderForUrl('/api/visitor-chat')).toBe(false)
  })
})
