import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getInternalApiBaseUrl,
  parseAddBlogResult,
  parseStartingIndex,
} from './syncBlogsHelpers'

function headers(values: Record<string, string | undefined>): Headers {
  const result = new Headers()
  Object.entries(values).forEach(([key, value]) => {
    if (value) result.set(key, value)
  })
  return result
}

describe('parseStartingIndex', () => {
  it.each([
    [undefined, null],
    ['0', null],
    ['abc', null],
    ['1', 1],
    ['61', 61],
  ])('maps %s to %s', (input, expected) => {
    expect(parseStartingIndex(input)).toBe(expected)
  })
})

describe('getInternalApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses http for localhost request hosts', () => {
    expect(getInternalApiBaseUrl(headers({ host: 'localhost:3001' }))).toBe(
      'http://localhost:3001',
    )
  })

  it('uses forwarded protocol for proxied request hosts', () => {
    expect(
      getInternalApiBaseUrl(
        headers({ host: 'mentorbridge.in', 'x-forwarded-proto': 'https' }),
      ),
    ).toBe('https://mentorbridge.in')
  })

  it('falls back to deployment env vars when request host is unavailable', () => {
    vi.stubEnv('VERCEL_URL', 'mentorbridge-git-main.vercel.app')
    expect(getInternalApiBaseUrl(headers({}))).toBe(
      'https://mentorbridge-git-main.vercel.app',
    )
  })
})

describe('parseAddBlogResult', () => {
  it('returns a safe error for non-JSON add-blog responses', () => {
    const result = parseAddBlogResult({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      contentType: 'text/html',
      rawBody: '<!DOCTYPE html><html><body>Not found</body></html>',
    })

    expect(result).toMatchObject({
      added: 0,
      skipped: 0,
      shouldCountTotals: false,
    })
    expect(result.error).toContain('add-blog returned non-JSON')
    expect(result.error).toContain('text/html')
  })

  it('preserves added and skipped counts from successful JSON responses', () => {
    expect(
      parseAddBlogResult({
        ok: true,
        status: 200,
        statusText: 'OK',
        contentType: 'application/json',
        rawBody: JSON.stringify({
          success: true,
          message: 'Done',
          data: { added: 2, skipped: 1, errors: [], total: 3 },
        }),
      }),
    ).toEqual({
      added: 2,
      skipped: 1,
      shouldCountTotals: true,
      error: undefined,
    })
  })

  it('returns API error messages without counting totals', () => {
    expect(
      parseAddBlogResult({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        contentType: 'application/json',
        rawBody: JSON.stringify({
          success: false,
          message: 'Medium is unavailable',
          data: { added: 0, skipped: 0, errors: [], total: 0 },
        }),
      }),
    ).toMatchObject({
      added: 0,
      skipped: 0,
      shouldCountTotals: false,
      error: 'Medium is unavailable',
    })
  })
})
