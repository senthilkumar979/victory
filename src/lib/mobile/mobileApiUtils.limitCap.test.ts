import { describe, expect, it, vi } from 'vitest'

import { parsePagination } from '@/lib/mobile/mobileApiUtils'

vi.mock('server-only', () => ({}))

describe('parsePagination limit cap', () => {
  it('caps limits above 100 and keeps an in-range limit of 100', () => {
    expect(
      parsePagination(new URL('https://example.com/items?page=1&limit=101')),
    ).toEqual({ page: 1, limit: 100 })
    expect(
      parsePagination(new URL('https://example.com/items?page=1&limit=1000')),
    ).toEqual({ page: 1, limit: 100 })
    expect(
      parsePagination(new URL('https://example.com/items?page=1&limit=100')),
    ).toEqual({ page: 1, limit: 100 })
    expect(
      parsePagination(new URL('https://example.com/items?page=1&limit=100.5')),
    ).toEqual({ page: 1, limit: 100 })
  })

  it('treats a negative limit as 1 because the number is truthy', () => {
    expect(
      parsePagination(new URL('https://example.com/items?page=2&limit=-5')),
    ).toEqual({ page: 2, limit: 1 })
  })

  it('raises a negative page to 1 and does not cap large page numbers', () => {
    expect(
      parsePagination(new URL('https://example.com/items?page=-4&limit=20')),
    ).toEqual({ page: 1, limit: 20 })
    expect(
      parsePagination(new URL('https://example.com/items?page=1000&limit=20')),
    ).toEqual({ page: 1000, limit: 20 })
  })

  it('falls back to the default limit when the value is not numeric', () => {
    expect(
      parsePagination(new URL('https://example.com/items?page=3&limit=abc')),
    ).toEqual({ page: 3, limit: 20 })
  })
})
