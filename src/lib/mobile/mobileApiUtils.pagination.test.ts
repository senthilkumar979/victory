import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: null }))

import {
  MobileServiceError,
  mobileErrorResponse,
  paginationMeta,
  parsePagination,
} from './mobileApiUtils'

function pageUrl(query: string) {
  return new URL(`http://localhost/api/mobile/v1/blogs${query}`)
}

describe('parsePagination', () => {
  it('caps limit at 100', () => {
    expect(parsePagination(pageUrl('?limit=100'))).toEqual({ page: 1, limit: 100 })
    expect(parsePagination(pageUrl('?limit=100.5'))).toEqual({ page: 1, limit: 100 })
    expect(parsePagination(pageUrl('?limit=101'))).toEqual({ page: 1, limit: 100 })
    expect(parsePagination(pageUrl('?limit=1000'))).toEqual({ page: 1, limit: 100 })
  })

  it('uses 1 for a negative limit and keeps the requested page', () => {
    expect(parsePagination(pageUrl('?page=2&limit=-5'))).toEqual({
      page: 2,
      limit: 1,
    })
  })

  it('falls back when the limit is not numeric', () => {
    expect(parsePagination(pageUrl('?page=3&limit=abc'))).toEqual({
      page: 3,
      limit: 20,
    })
  })

  it('uses defaults for blank and zero values', () => {
    expect(parsePagination(pageUrl('?page=&limit='))).toEqual({ page: 1, limit: 20 })
    expect(parsePagination(pageUrl('?page=0&limit=0'))).toEqual({
      page: 1,
      limit: 20,
    })
  })

  it('keeps fractional page and limit values', () => {
    expect(parsePagination(pageUrl('?page=2.9&limit=1.5'))).toEqual({
      page: 2.9,
      limit: 1.5,
    })
  })

  it('clamps a negative page and keeps a large page', () => {
    expect(parsePagination(pageUrl('?page=-4')).page).toBe(1)
    expect(parsePagination(pageUrl('?page=1000')).page).toBe(1000)
  })
})

describe('paginationMeta', () => {
  it('marks the last full page as having no next page', () => {
    expect(paginationMeta(2, 10, 20)).toEqual({
      page: 2,
      limit: 10,
      totalCount: 20,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it('keeps a single page when the count is negative', () => {
    expect(paginationMeta(1, 10, -1).totalPages).toBe(1)
  })

  it('does not invent a next page past the total', () => {
    expect(paginationMeta(5, 10, 20)).toMatchObject({
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })
})

describe('mobileErrorResponse', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('serializes omitted and null service details as an empty object', async () => {
    const omitted = mobileErrorResponse(
      new MobileServiceError('Could not load blogs.', 503, 'SERVICE_UNAVAILABLE'),
    )
    const explicitNull = mobileErrorResponse(
      new MobileServiceError('Could not load blogs.', 503, 'SERVICE_UNAVAILABLE', null),
    )

    expect(omitted.status).toBe(503)
    await expect(omitted.json()).resolves.toEqual({
      error: 'Could not load blogs.',
      code: 'SERVICE_UNAVAILABLE',
      details: {},
    })
    await expect(explicitNull.json()).resolves.toMatchObject({ details: {} })
  })

  it('hides Error messages and thrown strings from the client', async () => {
    const fromError = mobileErrorResponse(
      new Error('relation "blogs" does not exist'),
    )
    const fromString = mobileErrorResponse('service role key leaked')

    expect(fromError.status).toBe(500)
    const errorBody = await fromError.json()
    const stringBody = await fromString.json()
    expect(errorBody).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(stringBody).toEqual(errorBody)
    expect(JSON.stringify(errorBody)).not.toContain('relation')
    expect(JSON.stringify(stringBody)).not.toContain('leaked')
    expect(console.error).toHaveBeenCalled()
  })
})
