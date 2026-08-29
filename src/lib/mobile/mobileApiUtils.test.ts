import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const dbState = { client: null as unknown }

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import {
  getMobileDb,
  MobileServiceError,
  mobileErrorResponse,
  paginationMeta,
  parsePagination,
} from './mobileApiUtils'

describe('parsePagination', () => {
  it('defaults to page 1 and limit 20', () => {
    expect(parsePagination(new URL('http://localhost/api'))).toEqual({
      page: 1,
      limit: 20,
    })
  })

  it('clamps negative pages and oversized limits; zero falls back to defaults', () => {
    expect(
      parsePagination(new URL('http://localhost/api?page=0&limit=0')),
    ).toEqual({ page: 1, limit: 20 })
    expect(
      parsePagination(new URL('http://localhost/api?page=-4&limit=500')),
    ).toEqual({ page: 1, limit: 100 })
    expect(
      parsePagination(new URL('http://localhost/api?page=3&limit=1')),
    ).toEqual({ page: 3, limit: 1 })
  })

  it('treats non-numeric page and limit as defaults then clamps', () => {
    expect(
      parsePagination(new URL('http://localhost/api?page=abc&limit=xyz')),
    ).toEqual({ page: 1, limit: 20 })
  })
})

describe('paginationMeta', () => {
  it('computes page flags from the current window', () => {
    expect(paginationMeta(2, 10, 25)).toEqual({
      page: 2,
      limit: 10,
      totalCount: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    })
  })

  it('keeps totalPages at 1 when there are no rows', () => {
    expect(paginationMeta(1, 20, 0)).toMatchObject({
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })
})

describe('getMobileDb', () => {
  beforeEach(() => {
    dbState.client = null
  })

  it('throws SERVICE_UNAVAILABLE when the admin client is missing', () => {
    expect(() => getMobileDb()).toThrow(MobileServiceError)
    try {
      getMobileDb()
    } catch (err) {
      expect(err).toMatchObject({
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Server database is not configured.',
      })
    }
  })

  it('returns the configured admin client', () => {
    const client = { from: vi.fn() }
    dbState.client = client
    expect(getMobileDb()).toBe(client)
  })
})

describe('mobileErrorResponse', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('preserves MobileServiceError status, code, and details', async () => {
    const response = mobileErrorResponse(
      new MobileServiceError('Student not found', 404, 'NOT_FOUND', {
        id: 's1',
      }),
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: 'Student not found',
      code: 'NOT_FOUND',
      details: { id: 's1' },
    })
  })

  it('maps unknown errors to a generic 500 payload', async () => {
    const response = mobileErrorResponse(new Error('boom'))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
  })
})
