import { describe, expect, it } from 'vitest'

import { pathnameOnly, shouldShowLoaderForUrl } from './Loader'

describe('pathnameOnly', () => {
  it('extracts only the path from absolute and relative URLs', () => {
    expect(pathnameOnly('https://victory.example/api/students?limit=10#top')).toBe(
      '/api/students',
    )
    expect(pathnameOnly('/students/abc?tab=profile#bio')).toBe('/students/abc')
    expect(pathnameOnly('not a url')).toBe('not a url')
  })
})

describe('shouldShowLoaderForUrl', () => {
  it('does not show the global loader for same-origin page navigations or assets', () => {
    expect(shouldShowLoaderForUrl('/students/ada')).toBe(false)
    expect(shouldShowLoaderForUrl('/foo.png')).toBe(false)
    expect(shouldShowLoaderForUrl('/_next/static/chunk.js')).toBe(false)
  })

  it('shows the global loader for API and Supabase data requests only', () => {
    expect(shouldShowLoaderForUrl('/api/add-blog')).toBe(true)
    expect(shouldShowLoaderForUrl('https://victory.example/api/students')).toBe(true)
    expect(shouldShowLoaderForUrl('https://project.supabase.co/rest/v1/students')).toBe(
      true,
    )
  })

  it('keeps inline visitor chat loading out of the full-page overlay', () => {
    expect(shouldShowLoaderForUrl('/api/visitor-chat')).toBe(false)
    expect(shouldShowLoaderForUrl('/api/visitor-chat?message=hello')).toBe(false)
  })
})
