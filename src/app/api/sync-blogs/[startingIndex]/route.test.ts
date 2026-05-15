import type { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

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
    from: vi.fn(),
  },
}))

interface StudentRow {
  medium_username: string | null
}

interface StudentQueries {
  countQuery: {
    select: ReturnType<typeof vi.fn>
  }
  rowsQuery: {
    select: ReturnType<typeof vi.fn>
    order: ReturnType<typeof vi.fn>
    gte: ReturnType<typeof vi.fn>
    limit: ReturnType<typeof vi.fn>
  }
}

function createRequest(headers: HeadersInit = {}): NextRequest {
  return new Request('https://request.example.com/api/sync-blogs/5', {
    headers,
  }) as NextRequest
}

function mockStudentQueries(rows: StudentRow[], count = rows.length): StudentQueries {
  const countQuery = {
    select: vi.fn().mockResolvedValue({ count }),
  }
  const rowsQuery = {
    select: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
  }
  rowsQuery.select.mockReturnValue(rowsQuery)
  rowsQuery.order.mockReturnValue(rowsQuery)
  rowsQuery.gte.mockReturnValue(rowsQuery)
  fromMock.mockReturnValueOnce(countQuery).mockReturnValueOnce(rowsQuery)
  return { countQuery, rowsQuery }
}

describe('sync-blogs route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('rejects invalid starting indexes before calling Supabase or add-blog', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(createRequest(), {
      params: Promise.resolve({ startingIndex: '0' }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      message: 'Invalid startingIndex',
      data: {
        usernamesProcessed: 0,
        results: [],
      },
    })
    expect(fromMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts add-blog to the request origin and records non-JSON failures per username', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://prod.example.com'
    const { rowsQuery } = mockStudentQueries(
      [{ medium_username: ' ada ' }, { medium_username: '   ' }],
      2,
    )
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('<!doctype html> Missing route', {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(createRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: '5' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(rowsQuery.gte).toHaveBeenCalledWith('serial_no', 5)
    expect(rowsQuery.limit).toHaveBeenCalledWith(10)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'ada' }),
      }),
    )
    expect(body).toMatchObject({
      success: true,
      data: {
        usernamesProcessed: 1,
        usernamesSkipped: 1,
        totalAdded: 0,
        totalSkipped: 0,
        results: [
          {
            username: 'ada',
            added: 0,
            skipped: 0,
          },
        ],
      },
    })
    expect(body.data.results[0].error).toContain(
      'add-blog returned non-JSON (HTTP 404, text/html; charset=utf-8)',
    )
    expect(body.data.results[0].error).toContain('<!doctype html> Missing route')
  })
})
