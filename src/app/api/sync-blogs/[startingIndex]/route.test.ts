import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

function mockStudentsQuery({
  rows,
  totalStudents,
  error = null,
}: {
  rows: { medium_username: string | null }[] | null
  totalStudents: number
  error?: Error | null
}) {
  const limitMock = vi.fn().mockResolvedValue({ data: rows, error })
  const gteMock = vi.fn(() => ({ limit: limitMock }))
  const orderMock = vi.fn(() => ({ gte: gteMock }))

  fromMock.mockReturnValue({
    select: vi.fn((columns: string, options?: { head?: boolean }) => {
      if (options?.head) return Promise.resolve({ count: totalStudents })
      expect(columns).toBe('medium_username')
      return { order: orderMock }
    }),
  })

  return { gteMock, limitMock, orderMock }
}

function createRequest(url = 'http://localhost:3001/api/sync-blogs/61') {
  return new NextRequest(url, {
    headers: {
      host: 'localhost:3001',
    },
  })
}

describe('GET /api/sync-blogs/[startingIndex]', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('rejects missing or invalid starting indices before querying students', async () => {
    const response = await GET(createRequest(), {
      params: Promise.resolve({ startingIndex: '0' }),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      message: 'Invalid startingIndex',
      data: {
        startingIndex: 0,
        usernamesProcessed: 0,
        results: [],
      },
    })
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('posts trimmed usernames to the request origin and reports skipped or non-json results', async () => {
    const queryMocks = mockStudentsQuery({
      totalStudents: 4,
      rows: [
        { medium_username: ' alice ' },
        { medium_username: '' },
        { medium_username: null },
        { medium_username: 'bob' },
      ],
    })
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: 'Added blogs',
            data: { added: 2, skipped: 1, errors: [] },
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response('<!doctype html><p>Wrong app</p>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(createRequest(), {
      params: Promise.resolve({ startingIndex: '61' }),
    })

    expect(response.status).toBe(200)
    expect(queryMocks.orderMock).toHaveBeenCalledWith('serial_no', {
      ascending: true,
    })
    expect(queryMocks.gteMock).toHaveBeenCalledWith('serial_no', 61)
    expect(queryMocks.limitMock).toHaveBeenCalledWith(10)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'alice' }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'bob' }),
      }),
    )
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      message: 'Processed 2 usernames (2 skipped). Added: 2, Skipped: 1.',
      data: {
        startingIndex: 61,
        pageSize: 10,
        totalStudents: 4,
        usernamesProcessed: 2,
        usernamesSkipped: 2,
        totalAdded: 2,
        totalSkipped: 1,
        results: [
          { username: 'alice', added: 2, skipped: 1 },
          {
            username: 'bob',
            added: 0,
            skipped: 0,
            error:
              'add-blog returned non-JSON (HTTP 200, text/html): <!doctype html><p>Wrong app</p>',
          },
        ],
      },
    })
  })
})
