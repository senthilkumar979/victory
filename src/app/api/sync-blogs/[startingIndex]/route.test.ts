import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET, getInternalApiBaseUrl, parseStartingIndex } from './route'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: null,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface StudentRow {
  medium_username: string | null
}

function mockStudentsQuery(rows: StudentRow[]) {
  const totalQuery = {
    select: vi.fn().mockResolvedValue({
      count: rows.length,
      error: null,
    }),
  }
  const rowsQuery = {
    select: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    limit: vi.fn().mockResolvedValue({
      data: rows,
      error: null,
    }),
  }

  rowsQuery.select.mockReturnValue(rowsQuery)
  rowsQuery.order.mockReturnValue(rowsQuery)
  rowsQuery.gte.mockReturnValue(rowsQuery)
  fromMock.mockReturnValueOnce(totalQuery).mockReturnValueOnce(rowsQuery)

  return { rowsQuery }
}

describe('sync blogs route helpers', () => {
  const envBackup = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...envBackup }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    process.env = { ...envBackup }
  })

  it('rejects missing, zero, and non-numeric starting indexes', () => {
    expect(parseStartingIndex(undefined)).toBeNull()
    expect(parseStartingIndex('0')).toBeNull()
    expect(parseStartingIndex('abc')).toBeNull()
    expect(parseStartingIndex('61')).toBe(61)
  })

  it('builds internal API URLs from request headers before env fallbacks', () => {
    const localRequest = {
      headers: new Headers({ host: 'localhost:3001' }),
    } as NextRequest
    const productionRequest = {
      headers: new Headers({
        host: 'mentorbridge.in',
        'x-forwarded-proto': 'https',
      }),
    } as NextRequest

    expect(getInternalApiBaseUrl(localRequest)).toBe('http://localhost:3001')
    expect(getInternalApiBaseUrl(productionRequest)).toBe(
      'https://mentorbridge.in',
    )

    process.env.VERCEL_URL = 'victory.vercel.app'
    expect(
      getInternalApiBaseUrl({ headers: new Headers() } as NextRequest),
    ).toBe('https://victory.vercel.app')
  })

  it('records non-JSON add-blog responses and continues the batch', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockStudentsQuery([
      { medium_username: 'ada' },
      { medium_username: '  ' },
      { medium_username: 'grace' },
    ])

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('<!doctype html><html></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            message: 'Added blogs',
            data: { added: 2, skipped: 1, errors: [], total: 3 },
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(
      new NextRequest('http://localhost:3001/api/sync-blogs/1'),
      { params: Promise.resolve({ startingIndex: '1' }) },
    )
    const body = await response.json()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'ada' }),
      }),
    )
    expect(body.success).toBe(true)
    expect(body.data).toEqual(
      expect.objectContaining({
        usernamesProcessed: 2,
        usernamesSkipped: 1,
        totalAdded: 2,
        totalSkipped: 1,
      }),
    )
    expect(body.data.results[0]).toEqual(
      expect.objectContaining({
        username: 'ada',
        added: 0,
        skipped: 0,
        error: expect.stringContaining('add-blog returned non-JSON'),
      }),
    )
    expect(body.data.results[1]).toEqual(
      expect.objectContaining({
        username: 'grace',
        added: 2,
        skipped: 1,
      }),
    )
  })
})
