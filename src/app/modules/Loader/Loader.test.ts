import { describe, expect, it } from 'vitest'

import { shouldShowLoaderForUrl } from './Loader'

describe('shouldShowLoaderForUrl', () => {
  it('shows the global loader for API and Supabase data fetches', () => {
    expect(shouldShowLoaderForUrl('/api/students')).toBe(true)
    expect(shouldShowLoaderForUrl('/api/students?batch=2026')).toBe(true)
    expect(shouldShowLoaderForUrl('https://project.supabase.co/rest/v1/students')).toBe(
      true,
    )
  })

  it('does not show the loader for navigations, assets, or inline-loading APIs', () => {
    expect(shouldShowLoaderForUrl('/students')).toBe(false)
    expect(shouldShowLoaderForUrl('/_next/static/chunks/app.js')).toBe(false)
    expect(shouldShowLoaderForUrl('/images/hero.webp?version=1')).toBe(false)
    expect(shouldShowLoaderForUrl('/api/visitor-chat')).toBe(false)
    expect(shouldShowLoaderForUrl('/api/visitor-chat/')).toBe(false)
  })

  it('handles absolute URLs and invalid input safely', () => {
    expect(shouldShowLoaderForUrl('https://victory.example.com/api/events')).toBe(true)
    expect(shouldShowLoaderForUrl('https://victory.example.com/students/ada')).toBe(
      false,
    )
    expect(shouldShowLoaderForUrl('')).toBe(false)
  })
})
