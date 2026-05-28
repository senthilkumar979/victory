import { describe, expect, it } from 'vitest'

import {
  isExcludedFromGlobalLoader,
  pathnameOnly,
  shouldShowLoaderForUrl,
} from './loaderFetchHeuristics'

describe('pathnameOnly', () => {
  it('returns only the pathname for absolute and relative URLs', () => {
    expect(pathnameOnly('https://mentorbridge.in/api/foo?x=1#hash')).toBe(
      '/api/foo',
    )
    expect(pathnameOnly('/api/foo?x=1#hash')).toBe('/api/foo')
  })

  it('returns an empty string for malformed absolute URLs', () => {
    expect(pathnameOnly('https://')).toBe('')
  })
})

describe('isExcludedFromGlobalLoader', () => {
  it('excludes visitor chat API requests', () => {
    expect(isExcludedFromGlobalLoader('/api/visitor-chat')).toBe(true)
    expect(isExcludedFromGlobalLoader('/api/visitor-chat/')).toBe(true)
    expect(
      isExcludedFromGlobalLoader('https://mentorbridge.in/api/visitor-chat?x=1'),
    ).toBe(true)
  })

  it('does not exclude other API requests', () => {
    expect(isExcludedFromGlobalLoader('/api/add-blog')).toBe(false)
  })
})

describe('shouldShowLoaderForUrl', () => {
  it('shows the loader for data-fetching API and Supabase requests', () => {
    expect(shouldShowLoaderForUrl('/api/add-blog')).toBe(true)
    expect(shouldShowLoaderForUrl('/api/sync-blogs/1?refresh=1')).toBe(true)
    expect(
      shouldShowLoaderForUrl('https://project.supabase.co/rest/v1/students'),
    ).toBe(true)
  })

  it('does not show the loader for excluded or non-data fetches', () => {
    expect(shouldShowLoaderForUrl('/api/visitor-chat')).toBe(false)
    expect(shouldShowLoaderForUrl('/students/abc')).toBe(false)
    expect(shouldShowLoaderForUrl('/_next/data/build-id/page.json')).toBe(false)
    expect(shouldShowLoaderForUrl('/logo.png?cache=1')).toBe(false)
    expect(shouldShowLoaderForUrl('')).toBe(false)
  })
})
