import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: null,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: fromMock },
}))

interface StudentRow {
  medium_username: string | null
}

const originalVercelUrl = process.env.VERCEL_URL
const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL

function makeRequest(headers: Record<string, string>): NextRequest {
  return { headers: new Headers(headers) } as NextRequest
}

function restoreEnvValue(key: 'VERCEL_URL' | 'NEXT_PUBLIC_APP_URL', value?: string) {
  if (value === undefined) {
    delete process.env[key]
    return
  }

  process.env[key] = value
}

function setupStudentsQuery(rows: StudentRow[], count = rows.length) {
  const countSelectMock = vi.fn().mockResolvedValue({ count })
  const limitMock = vi.fn().mockResolvedValue({ data: rows, error: null })
  const gteMock = vi.fn(() => ({ limit: limitMock }))
  const orderMock = vi.fn(() => ({ gte: gteMock }))
  const rowsSelectMock = vi.fn(() => ({ order: orderMock }))

  fromMock
    .mockReturnValueOnce({ select: countSelectMock })
    .mockReturnValueOnce({ select: rowsSelectMock })

  return { countSelectMock, rowsSelectMock, orderMock, gteMock, limitMock }
}

describe('GET /api/sync-blogs/[startingIndex]', () => {
  beforeEach(() => {
    fromMock.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    restoreEnvValue('VERCEL_URL', originalVercelUrl)
    restoreEnvValue('NEXT_PUBLIC_APP_URL', originalAppUrl)
  })

  it('posts add-blog requests to the incoming host instead of the configured app URL', async () => {
    process.env.VERCEL_URL = 'production.example.com'
    process.env.NEXT_PUBLIC_APP_URL = 'https://configured.example.com'
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            success: true,
            message: 'ok',
            data: { added: 2, skipped: 1, errors: [], total: 3 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    const query = setupStudentsQuery(
      [{ medium_username: ' ada ' }, { medium_username: '  ' }],
      42,
    )

    const response = await GET(makeRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: '61' }),
    })
    const body = await response.json()

    expect(query.gteMock).toHaveBeenCalledWith('serial_no', 61)
    expect(query.limitMock).toHaveBeenCalledWith(10)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'ada' }),
      }),
    )
    expect(body.data).toMatchObject({
      startingIndex: 61,
      totalStudents: 42,
      usernamesProcessed: 1,
      usernamesSkipped: 1,
      totalAdded: 2,
      totalSkipped: 1,
    })
  })

  it('records a per-user error when add-blog returns non-JSON content', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('<!DOCTYPE html>\n<html>not found</html>', {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    setupStudentsQuery([{ medium_username: 'grace' }])

    const response = await GET(
      makeRequest({ host: 'mentorbridge.example', 'x-forwarded-proto': 'https' }),
      { params: Promise.resolve({ startingIndex: '1' }) },
    )
    const body = await response.json()

    expect(fetchMock).toHaveBeenCalledWith(
      'https://mentorbridge.example/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'grace' }),
      }),
    )
    expect(body.success).toBe(true)
    expect(body.data.totalAdded).toBe(0)
    expect(body.data.totalSkipped).toBe(0)
    expect(body.data.results).toEqual([
      {
        username: 'grace',
        added: 0,
        skipped: 0,
        error:
          'add-blog returned non-JSON (HTTP 404, text/html; charset=utf-8): <!DOCTYPE html> <html>not found</html>',
      },
    ])
  })
})
