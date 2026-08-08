import { describe, expect, it } from 'vitest'

import {
  isExcludedFromGlobalLoader,
  pathnameOnly,
  shouldShowLoaderForUrl,
} from './Loader'

describe('loader fetch heuristics', () => {
  it.each([
    ['/api/sync-blogs/1', true],
    ['https://host.supabase.co/rest/v1/students', true],
    ['/students/abc?_rsc=xyz', false],
    ['/students/abc', false],
    ['/logo.png', false],
    ['/api/visitor-chat', false],
    ['https://example.com/api/foo', true],
  ])('returns %s for %s', (url, expected) => {
    expect(shouldShowLoaderForUrl(url)).toBe(expected)
  })

  it('normalizes absolute and relative URLs to pathnames', () => {
    expect(pathnameOnly('https://example.com/api/foo?x=1#hash')).toBe(
      '/api/foo',
    )
    expect(pathnameOnly('/students/abc?x=1#hash')).toBe('/students/abc')
  })

  it('excludes visitor chat with or without a trailing slash', () => {
    expect(isExcludedFromGlobalLoader('/api/visitor-chat')).toBe(true)
    expect(isExcludedFromGlobalLoader('/api/visitor-chat/')).toBe(true)
  })
})
