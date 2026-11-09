import { describe, expect, it, vi } from 'vitest'

import {
  MobileServiceError,
  mobileErrorResponse,
  paginationMeta,
  parsePagination,
} from '@/lib/mobile/mobileApiUtils'

vi.mock('server-only', () => ({}))

describe('parsePagination bounds', () => {
  it('treats blank and zero values as the defaults', () => {
    expect(
      parsePagination(new URL('https://example.com/items?page=&limit=')),
    ).toEqual({ page: 1, limit: 20 })
    expect(
      parsePagination(new URL('https://example.com/items?page=0&limit=0')),
    ).toEqual({ page: 1, limit: 20 })
  })

  it('preserves in-range fractional page and limit values', () => {
    expect(
      parsePagination(new URL('https://example.com/items?page=2.9&limit=1.5')),
    ).toEqual({ page: 2.9, limit: 1.5 })
  })
})

describe('paginationMeta bounds', () => {
  it('marks the last exact page as the end of the list', () => {
    expect(paginationMeta(2, 10, 20)).toEqual({
      page: 2,
      limit: 10,
      totalCount: 20,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it('keeps a single page when the total count is negative', () => {
    expect(paginationMeta(1, 10, -1)).toMatchObject({
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })

  it('does not report a next page once the caller is past the last page', () => {
    expect(paginationMeta(5, 10, 20)).toMatchObject({
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })
})

describe('mobileErrorResponse redaction', () => {
  it('fills an object when a service error omits details', async () => {
    const response = mobileErrorResponse(
      new MobileServiceError('Not found', 404, 'NOT_FOUND'),
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: 'Not found',
      code: 'NOT_FOUND',
      details: {},
    })
  })

  it('replaces null details and hides unexpected thrown values', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const nullDetails = mobileErrorResponse(
      new MobileServiceError('Not found', 404, 'NOT_FOUND', null),
    )
    const leakedBody = await mobileErrorResponse(
      new Error('database password'),
    ).json()
    const thrownStringBody = await mobileErrorResponse('socket hang up').json()

    await expect(nullDetails.json()).resolves.toMatchObject({ details: {} })
    expect(leakedBody).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(thrownStringBody).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
