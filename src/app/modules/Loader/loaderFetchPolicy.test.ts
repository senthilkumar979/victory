import { describe, expect, it } from 'vitest'

import { shouldShowLoaderForUrl } from './loaderFetchPolicy'

describe('shouldShowLoaderForUrl', () => {
  it.each([
    ['/api/students'],
    ['/api/students?limit=10#results'],
    ['https://victory.example.com/api/announcements'],
    ['https://project.supabase.co/rest/v1/students?select=*'],
  ])('shows the global loader for data fetches: %s', (url) => {
    expect(shouldShowLoaderForUrl(url)).toBe(true)
  })

  it.each([
    [''],
    ['/secured/profile'],
    ['https://victory.example.com/secured/profile?_rsc=1'],
    ['/_next/static/chunks/app/page.js'],
    ['https://victory.example.com/images/logo.svg?v=1'],
    ['/api/visitor-chat'],
    ['/api/visitor-chat/'],
    ['/api/visitor-chat?message=hello'],
    ['http://[invalid-url'],
  ])('skips the global loader for non-data fetches: %s', (url) => {
    expect(shouldShowLoaderForUrl(url)).toBe(false)
  })
})
