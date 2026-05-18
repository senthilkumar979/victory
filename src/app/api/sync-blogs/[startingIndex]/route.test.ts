import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

const { fetchMock, fromMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: null }))
vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: fromMock } }))

const createRequest = () =>
  ({ headers: new Headers({ host: 'localhost:3001' }) }) as NextRequest

function createParams(startingIndex: string) {
  return { params: Promise.resolve({ startingIndex }) }
}

function mockStudentQueries({
  fetchError = null,
  rows = [],
  totalStudents = rows.length,
}: {
  fetchError?: unknown
  rows?: { medium_username: string | null }[]
  totalStudents?: number
}) {
  const countQuery = { select: vi.fn().mockResolvedValue({ count: totalStudents }) }
  const rowsQuery = {
    select: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data: rows, error: fetchError }),
  }
  rowsQuery.select.mockReturnValue(rowsQuery)
  rowsQuery.order.mockReturnValue(rowsQuery)
  rowsQuery.gte.mockReturnValue(rowsQuery)
  fromMock.mockReturnValueOnce(countQuery).mockReturnValueOnce(rowsQuery)
  return rowsQuery
}

function createJsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  })
}

describe('GET /api/sync-blogs/[startingIndex]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('rejects invalid starting indexes before querying Supabase', async () => {
    const response = await GET(createRequest(), createParams('0'))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.message).toBe('Invalid startingIndex')
    expect(fromMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts trimmed usernames to the request origin and reports skipped users', async () => {
    const query = mockStudentQueries({
      rows: [
        { medium_username: ' alice ' },
        { medium_username: null },
        { medium_username: 'bob' },
      ],
      totalStudents: 12,
    })
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        success: true,
        message: 'Added blogs',
        data: { added: 2, skipped: 1, errors: [] },
      }),
    )
    fetchMock.mockResolvedValueOnce(
      new Response('<!doctype html><html>not json</html>', {
        headers: { 'content-type': 'text/html' },
        status: 200,
      }),
    )

    const response = await GET(createRequest(), createParams('61'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(query.gte).toHaveBeenCalledWith('serial_no', 61)
    expect(query.limit).toHaveBeenCalledWith(10)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({ body: JSON.stringify({ username: 'alice' }) }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({ body: JSON.stringify({ username: 'bob' }) }),
    )
    expect(body.data).toEqual(
      expect.objectContaining({
        totalAdded: 2,
        totalSkipped: 1,
        totalStudents: 12,
        usernamesProcessed: 2,
        usernamesSkipped: 1,
      }),
    )
    expect(body.data.results).toEqual([
      { username: 'alice', added: 2, skipped: 1 },
      expect.objectContaining({
        error: expect.stringContaining('add-blog returned non-JSON'),
        username: 'bob',
      }),
    ])
  })

  it('returns a failure response when students cannot be fetched', async () => {
    mockStudentQueries({
      fetchError: { message: 'database unavailable' },
      totalStudents: 4,
    })

    const response = await GET(createRequest(), createParams('3'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('Failed to fetch students')
    expect(body.data.startingIndex).toBe(3)
    expect(body.data.totalStudents).toBe(4)
    expect(body.data.results).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
