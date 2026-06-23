import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

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

interface StudentsCountQuery {
  select: ReturnType<typeof vi.fn>
}

interface StudentsUsernamesQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function mockStudentsQueries(rows: unknown[], totalStudents: number): StudentsUsernamesQuery {
  const countQuery: StudentsCountQuery = {
    select: vi.fn().mockResolvedValue({ count: totalStudents }),
  }
  const usernamesQuery: StudentsUsernamesQuery = {
    select: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
  }

  usernamesQuery.select.mockReturnValue(usernamesQuery)
  usernamesQuery.order.mockReturnValue(usernamesQuery)
  usernamesQuery.gte.mockReturnValue(usernamesQuery)
  fromMock.mockReturnValueOnce(countQuery).mockReturnValueOnce(usernamesQuery)

  return usernamesQuery
}

function createRequest(host = 'localhost:3001'): NextRequest {
  return new NextRequest(`http://${host}/api/sync-blogs/1`, {
    headers: { host },
  })
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function callRoute(
  startingIndex: string,
  request = createRequest(),
): Promise<Response> {
  return GET(request, { params: Promise.resolve({ startingIndex }) })
}

describe('GET /api/sync-blogs/[startingIndex]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.stubGlobal('fetch', vi.fn())
  })

  it('rejects an invalid starting index without querying students', async () => {
    const response = await callRoute('0')
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
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

  it('posts trimmed Medium usernames to the same local origin', async () => {
    const query = mockStudentsQueries(
      [
        { medium_username: ' ada ' },
        { medium_username: '' },
        { medium_username: null },
        { medium_username: '@grace' },
      ],
      4,
    )
    const fetchMock = vi.mocked(fetch)
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          message: 'ok',
          data: { added: 2, skipped: 1, errors: [], total: 3 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          message: 'ok',
          data: { added: 0, skipped: 2, errors: ['duplicate'], total: 2 },
        }),
      )

    const response = await callRoute('11')
    const body = await response.json()

    expect(query.select).toHaveBeenCalledWith('medium_username')
    expect(query.order).toHaveBeenCalledWith('serial_no', { ascending: true })
    expect(query.gte).toHaveBeenCalledWith('serial_no', 11)
    expect(query.limit).toHaveBeenCalledWith(10)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'ada' }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: '@grace' }),
      }),
    )
    expect(body).toMatchObject({
      success: true,
      data: {
        startingIndex: 11,
        totalStudents: 4,
        usernamesProcessed: 2,
        usernamesSkipped: 2,
        totalAdded: 2,
        totalSkipped: 3,
        results: [
          { username: 'ada', added: 2, skipped: 1 },
          { username: '@grace', added: 0, skipped: 2, error: 'duplicate' },
        ],
      },
    })
  })

  it('records a per-user error when add-blog returns non-JSON', async () => {
    mockStudentsQueries([{ medium_username: 'ada' }], 1)
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('<!DOCTYPE html><h1>Not Found</h1>', {
        status: 404,
        headers: { 'content-type': 'text/html' },
      }),
    )

    const response = await callRoute('1')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data).toMatchObject({
      usernamesProcessed: 1,
      totalAdded: 0,
      totalSkipped: 0,
      results: [
        {
          username: 'ada',
          added: 0,
          skipped: 0,
        },
      ],
    })
    expect(body.data.results[0].error).toContain(
      'add-blog returned non-JSON (HTTP 404, text/html)',
    )
  })
})
