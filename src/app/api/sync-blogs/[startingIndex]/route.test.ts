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

interface StudentRow {
  medium_username: string | null
}

interface StudentQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function mockStudentBatch(rows: StudentRow[], count = rows.length): StudentQuery {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    limit: vi.fn(),
  }

  query.select.mockImplementation((columns: string) => {
    if (columns === '*') return Promise.resolve({ count })
    return query
  })
  query.order.mockReturnValue(query)
  query.gte.mockReturnValue(query)
  query.limit.mockResolvedValue({ data: rows, error: null })
  fromMock.mockReturnValue(query)

  return query
}

function makeRequest(host = 'localhost:3001', forwardedProto?: string): NextRequest {
  return new NextRequest(`http://${host}/api/sync-blogs/61`, {
    headers: {
      host,
      ...(forwardedProto ? { 'x-forwarded-proto': forwardedProto } : {}),
    },
  })
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    ...init,
  })
}

function expectAddBlogFetch(index: number, url: string, username?: string): void {
  const init =
    username === undefined
      ? expect.any(Object)
      : expect.objectContaining({ body: JSON.stringify({ username }) })
  expect(fetch).toHaveBeenNthCalledWith(index, url, init)
}

describe('sync blogs route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    globalThis.fetch = vi.fn()
  })

  it('posts trimmed usernames to the incoming request origin and aggregates results', async () => {
    const query = mockStudentBatch([
      { medium_username: ' ada ' },
      { medium_username: null },
      { medium_username: 'grace' },
    ])
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ data: { added: 2, skipped: 1 } }))
      .mockResolvedValueOnce(jsonResponse({ data: { added: 1, skipped: 0 } }))

    const response = await GET(makeRequest(), {
      params: Promise.resolve({ startingIndex: '61' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.order).toHaveBeenCalledWith('serial_no', { ascending: true })
    expect(query.gte).toHaveBeenCalledWith('serial_no', 61)
    expect(query.limit).toHaveBeenCalledWith(10)
    expectAddBlogFetch(1, 'http://localhost:3001/api/add-blog', 'ada')
    expectAddBlogFetch(2, 'http://localhost:3001/api/add-blog', 'grace')
    expect(body.data).toEqual(
      expect.objectContaining({
        usernamesProcessed: 2,
        usernamesSkipped: 1,
        totalAdded: 3,
        totalSkipped: 1,
      }),
    )
  })

  it('records non-json add-blog responses without failing the whole batch', async () => {
    mockStudentBatch([{ medium_username: 'ada' }, { medium_username: 'grace' }])
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response('<!DOCTYPE html><html>Not found</html>', {
          status: 404,
          headers: { 'content-type': 'text/html' },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: { added: 1, skipped: 0 } }))

    const response = await GET(makeRequest('preview.mentorbridge.in', 'https'), {
      params: Promise.resolve({ startingIndex: '61' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expectAddBlogFetch(1, 'https://preview.mentorbridge.in/api/add-blog')
    expectAddBlogFetch(2, 'https://preview.mentorbridge.in/api/add-blog')
    expect(body.data.totalAdded).toBe(1)
    expect(body.data.results).toEqual([
      expect.objectContaining({
        username: 'ada',
        added: 0,
        error:
          'add-blog returned non-JSON (HTTP 404, text/html): <!DOCTYPE html><html>Not found</html>',
      }),
      expect.objectContaining({ username: 'grace', added: 1 }),
    ])
  })
})
