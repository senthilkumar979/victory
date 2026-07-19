import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getMobileDb,
  MobileServiceError,
  mobileErrorResponse,
  paginationMeta,
  parsePagination,
} from '@/lib/mobile/mobileApiUtils'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: null }))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('parsePagination', () => {
  it('uses defaults for missing or non-numeric values', () => {
    expect(parsePagination(new URL('https://example.com/items'))).toEqual({
      page: 1,
      limit: 20,
    })
    expect(
      parsePagination(
        new URL('https://example.com/items?page=invalid&limit=invalid'),
      ),
    ).toEqual({ page: 1, limit: 20 })
  })

  it('clamps pagination values to safe API limits', () => {
    expect(
      parsePagination(new URL('https://example.com/items?page=-4&limit=500')),
    ).toEqual({ page: 1, limit: 100 })
    expect(
      parsePagination(new URL('https://example.com/items?page=3&limit=0')),
    ).toEqual({ page: 3, limit: 1 })
  })
})

describe('paginationMeta', () => {
  it('reports page boundaries and preserves an empty first page', () => {
    expect(paginationMeta(1, 20, 0)).toEqual({
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
    expect(paginationMeta(2, 10, 25)).toMatchObject({
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    })
  })
})

describe('mobile service failures', () => {
  it('fails explicitly when the service-role database is unavailable', () => {
    expect(getMobileDb).toThrowError(
      expect.objectContaining({
        message: 'Server database is not configured.',
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
      }),
    )
  })

  it('serializes expected errors without leaking unexpected details', async () => {
    const expectedResponse = mobileErrorResponse(
      new MobileServiceError('Not found', 404, 'NOT_FOUND', { id: 'missing' }),
    )
    expect(expectedResponse.status).toBe(404)
    await expect(expectedResponse.json()).resolves.toEqual({
      error: 'Not found',
      code: 'NOT_FOUND',
      details: { id: 'missing' },
    })

    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const unexpectedResponse = mobileErrorResponse(new Error('database secret'))
    expect(unexpectedResponse.status).toBe(500)
    await expect(unexpectedResponse.json()).resolves.toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
  })
})
