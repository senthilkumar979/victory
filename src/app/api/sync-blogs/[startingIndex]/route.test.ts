import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

const { adminFromMock, anonFromMock } = vi.hoisted(() => ({
  adminFromMock: vi.fn(),
  anonFromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: { from: adminFromMock },
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: anonFromMock },
}))

interface StudentRow {
  medium_username: string | null
}

interface StudentRowsQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function mockStudentBatch(rows: StudentRow[], totalStudents = rows.length) {
  const countQuery = {
    select: vi.fn().mockResolvedValue({ count: totalStudents }),
  }
  const rowsQuery: StudentRowsQuery = {
    select: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
  }

  rowsQuery.select.mockReturnValue(rowsQuery)
  rowsQuery.order.mockReturnValue(rowsQuery)
  rowsQuery.gte.mockReturnValue(rowsQuery)
  adminFromMock.mockReturnValueOnce(countQuery).mockReturnValueOnce(rowsQuery)

  return { countQuery, rowsQuery }
}

describe('GET /api/sync-blogs/[startingIndex]', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('rejects invalid starting indexes before reading students', async () => {
    const response = await GET(
      new NextRequest('http://localhost:3001/api/sync-blogs/0'),
      { params: Promise.resolve({ startingIndex: '0' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.message).toBe('Invalid startingIndex')
    expect(adminFromMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts to the incoming origin and records non-JSON add-blog responses', async () => {
    const { rowsQuery } = mockStudentBatch(
      [
        { medium_username: ' ada ' },
        { medium_username: '' },
        { medium_username: null },
      ],
      12,
    )
    fetchMock.mockResolvedValue(
      new Response('<!doctype html>\n<html>Not found</html>', {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    )

    const response = await GET(
      new NextRequest('http://localhost:3001/api/sync-blogs/61', {
        headers: { host: 'localhost:3001' },
      }),
      { params: Promise.resolve({ startingIndex: '61' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(adminFromMock).toHaveBeenCalledWith('students')
    expect(rowsQuery.gte).toHaveBeenCalledWith('serial_no', 61)
    expect(rowsQuery.limit).toHaveBeenCalledWith(10)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/add-blog',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'ada' }),
      }),
    )
    expect(body.data).toMatchObject({
      totalStudents: 12,
      usernamesProcessed: 1,
      usernamesSkipped: 2,
      totalAdded: 0,
      totalSkipped: 0,
    })
    expect(body.data.results).toEqual([
      {
        username: 'ada',
        added: 0,
        skipped: 0,
        error:
          'add-blog returned non-JSON (HTTP 404, text/html; charset=utf-8): <!doctype html> <html>Not found</html>',
      },
    ])
    expect(anonFromMock).not.toHaveBeenCalled()
  })
})
