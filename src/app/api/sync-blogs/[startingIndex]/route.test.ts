import { NextRequest } from 'next/server'
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
    from: fromMock,
  },
}))

interface SyncBlogsJson {
  success: boolean
  message: string
  data: {
    startingIndex: number
    totalStudents: number | null
    usernamesProcessed: number
    usernamesSkipped: number
    totalAdded: number
    totalSkipped: number
    results: {
      username: string
      added: number
      skipped: number
      error?: string
    }[]
  }
}

interface StudentRow {
  medium_username: string | null
}

function mockStudentQueries(rows: StudentRow[], totalStudents = rows.length): void {
  const countQuery = {
    select: vi.fn().mockResolvedValue({ count: totalStudents }),
  }
  const rowQuery = {
    select: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
  }

  rowQuery.select.mockReturnValue(rowQuery)
  rowQuery.order.mockReturnValue(rowQuery)
  rowQuery.gte.mockReturnValue(rowQuery)
  fromMock.mockReturnValueOnce(countQuery).mockReturnValueOnce(rowQuery)
}

function makeRequest(headers?: HeadersInit): NextRequest {
  return new NextRequest('http://localhost:3001/api/sync-blogs/1', { headers })
}

function makeParams(startingIndex: string): { params: Promise<{ startingIndex: string }> } {
  return { params: Promise.resolve({ startingIndex }) }
}

describe('GET /api/sync-blogs/[startingIndex]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  it('rejects invalid starting indexes before querying students', async () => {
    const response = await GET(makeRequest({ host: 'localhost:3001' }), makeParams('0'))
    const payload = (await response.json()) as SyncBlogsJson

    expect(response.status).toBe(400)
    expect(payload).toMatchObject({
      success: false,
      message: 'Invalid startingIndex',
      data: {
        startingIndex: 0,
        usernamesProcessed: 0,
        results: [],
      },
    })
    expect(fromMock).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('uses the request origin for local add-blog calls and keeps processing after non-JSON responses', async () => {
    mockStudentQueries(
      [
        { medium_username: ' ada ' },
        { medium_username: null },
        { medium_username: '   ' },
        { medium_username: 'grace' },
      ],
      4,
    )
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response('<!doctype html><p>not found</p>', {
          status: 404,
          headers: { 'content-type': 'text/html' },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          success: true,
          data: { added: 2, skipped: 1, errors: [] },
        }),
      )

    const response = await GET(makeRequest({ host: 'localhost:3001' }), makeParams('1'))
    const payload = (await response.json()) as SyncBlogsJson

    expect(response.status).toBe(200)
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'ada' }),
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'grace' }),
      }),
    )
    expect(payload.data).toMatchObject({
      startingIndex: 1,
      totalStudents: 4,
      usernamesProcessed: 2,
      usernamesSkipped: 2,
      totalAdded: 2,
      totalSkipped: 1,
    })
    expect(payload.data.results[0]).toMatchObject({
      username: 'ada',
      added: 0,
      skipped: 0,
    })
    expect(payload.data.results[0].error).toContain(
      'add-blog returned non-JSON (HTTP 404, text/html)',
    )
    expect(payload.data.results[1]).toMatchObject({
      username: 'grace',
      added: 2,
      skipped: 1,
    })
  })

  it('falls back to VERCEL_URL when the request host header is unavailable', async () => {
    const previousVercelUrl = process.env.VERCEL_URL
    process.env.VERCEL_URL = 'preview.example.vercel.app'
    mockStudentQueries([{ medium_username: 'ada' }], 1)
    vi.mocked(fetch).mockResolvedValue(
      Response.json({
        success: true,
        data: { added: 1, skipped: 0, errors: [] },
      }),
    )

    try {
      const response = await GET(makeRequest(), makeParams('1'))

      expect(response.status).toBe(200)
      expect(fetch).toHaveBeenCalledWith(
        'https://preview.example.vercel.app/api/add-blog',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'ada' }),
        }),
      )
    } finally {
      process.env.VERCEL_URL = previousVercelUrl
    }
  })
})
