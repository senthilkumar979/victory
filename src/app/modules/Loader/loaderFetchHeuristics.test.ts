import { describe, expect, it } from 'vitest'

import {
  isExcludedFromGlobalLoader,
  pathnameOnly,
  shouldShowLoaderForUrl,
} from './Loader'

describe('loader fetch heuristics', () => {
  it.each([
    ['/api/meetings?week=current#top', '/api/meetings'],
    ['https://example.com/api/meetings?week=current#top', '/api/meetings'],
    ['not a url?query=1#hash', 'not a url'],
  ])('returns only the pathname for %s', (url, expected) => {
    expect(pathnameOnly(url)).toBe(expected)
  })

  it.each([
    '/api/meetings',
    '/api/meetings?week=current',
    'https://example.com/api/meetings',
    'https://project.supabase.co/rest/v1/students',
  ])('shows the global loader for data fetches to %s', (url) => {
    expect(shouldShowLoaderForUrl(url)).toBe(true)
  })

  it.each([
    '',
    '/secured/dashboard',
    '/_next/static/chunk.js',
    '/images/logo.png?size=small',
    'https://example.com/assets/site.css',
    '/api/visitor-chat',
    '/api/visitor-chat?session=abc',
  ])('does not show the global loader for %s', (url) => {
    expect(shouldShowLoaderForUrl(url)).toBe(false)
  })

  it('normalizes visitor chat URLs before excluding them', () => {
    expect(isExcludedFromGlobalLoader('/api/visitor-chat/')).toBe(true)
    expect(isExcludedFromGlobalLoader('https://example.com/api/visitor-chat')).toBe(true)
  })
})
