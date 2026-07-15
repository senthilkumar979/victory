import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET, getInternalApiBaseUrl, parseStartingIndex } from './route'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: fromMock,
  },
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface ListStudentsQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function createRequest(
  url: string,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(url, { headers })
}

function mockStudentQueries(rows: Array<{ medium_username: string | null }>) {
  const countQuery = {
    select: vi.fn().mockResolvedValue({ count: rows.length, error: null }),
  }
  const listQuery: ListStudentsQuery = {
    select: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
  }
  listQuery.select.mockReturnValue(listQuery)
  listQuery.order.mockReturnValue(listQuery)
  listQuery.gte.mockReturnValue(listQuery)

  fromMock.mockReturnValueOnce(countQuery).mockReturnValueOnce(listQuery)

  return { countQuery, listQuery }
}

describe('sync-blogs route helpers', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('parses only positive starting indexes', () => {
    expect(parseStartingIndex(undefined)).toBeNull()
    expect(parseStartingIndex('0')).toBeNull()
    expect(parseStartingIndex('abc')).toBeNull()
    expect(parseStartingIndex('61')).toBe(61)
  })

  it('builds internal API base URLs from request origin before env fallbacks', () => {
    expect(
      getInternalApiBaseUrl(
        createRequest('http://localhost:3001/api/sync-blogs/1', {
          host: 'localhost:3001',
        }),
      ),
    ).toBe('http://localhost:3001')

    expect(
      getInternalApiBaseUrl(
        createRequest('https://victory.example/api/sync-blogs/1', {
          host: 'victory.example',
          'x-forwarded-proto': 'https',
        }),
      ),
    ).toBe('https://victory.example')
  })

  it('uses deployment env fallbacks when host is unavailable', () => {
    process.env.VERCEL_URL = 'preview.example.vercel.app'
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example'

    expect(
      getInternalApiBaseUrl(createRequest('https://fallback.example/api/sync-blogs/1')),
    ).toBe('https://preview.example.vercel.app')

    delete process.env.VERCEL_URL

    expect(
      getInternalApiBaseUrl(createRequest('https://fallback.example/api/sync-blogs/1')),
    ).toBe('https://app.example')
  })
})

describe('GET /api/sync-blogs/[startingIndex]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('records non-JSON add-blog responses per username and keeps the sync response successful', async () => {
    const { listQuery } = mockStudentQueries([
      { medium_username: ' ada ' },
      { medium_username: null },
    ])
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('<!DOCTYPE html><main>Not found</main>', {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(
      createRequest('http://localhost:3001/api/sync-blogs/61', {
        host: 'localhost:3001',
      }),
      { params: Promise.resolve({ startingIndex: '61' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(listQuery.gte).toHaveBeenCalledWith('serial_no', 61)
    expect(listQuery.limit).toHaveBeenCalledWith(10)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/add-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ada' }),
    })
    expect(body.success).toBe(true)
    expect(body.data.usernamesProcessed).toBe(1)
    expect(body.data.usernamesSkipped).toBe(1)
    expect(body.data.results).toEqual([
      {
        username: 'ada',
        added: 0,
        skipped: 0,
        error:
          'add-blog returned non-JSON (HTTP 404, text/html; charset=utf-8): <!DOCTYPE html><main>Not found</main>',
      },
    ])
  })
})
