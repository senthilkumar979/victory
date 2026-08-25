import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAdminMock, dbState } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  dbState: { client: null as unknown },
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAdmin: requireAdminMock,
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import { NextResponse } from 'next/server'

import { GET } from './route'

function mockQuery(result: {
  data: unknown[] | null
  error: { message: string } | null
}) {
  const limit = vi.fn().mockResolvedValue(result)
  const order = vi.fn().mockReturnValue({ limit })
  const select = vi.fn().mockReturnValue({ order })
  const from = vi.fn().mockReturnValue({ select })
  dbState.client = { from }
  return { from, select, order, limit }
}

describe('GET /api/admin/visitor-chat-queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = { from: vi.fn() }
    requireAdminMock.mockResolvedValue({
      context: { user: { id: 'admin-1' }, email: 'admin@example.com' },
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns the admin auth response before querying', async () => {
    requireAdminMock.mockResolvedValue({
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    })

    const response = await GET()

    expect(response.status).toBe(403)
    expect(
      (dbState.client as { from: ReturnType<typeof vi.fn> }).from,
    ).not.toHaveBeenCalled()
  })

  it('returns 503 when the admin database client is missing', async () => {
    dbState.client = null

    const response = await GET()

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Server database is not configured.',
    })
  })

  it('maps query failures to 500 without leaking database details', async () => {
    mockQuery({ data: null, error: { message: 'permission denied' } })

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load visitor queries.',
    })
  })

  it('returns newest queries first, capped at 500, and treats null data as empty', async () => {
    const { from, select, order, limit } = mockQuery({ data: null, error: null })

    const response = await GET()

    expect(from).toHaveBeenCalledWith('visitor_chat_queries')
    expect(select).toHaveBeenCalledWith(
      'id, created_at, query_text, thread_message_count',
    )
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(limit).toHaveBeenCalledWith(500)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ queries: [] })
  })

  it('returns query rows from the database', async () => {
    const rows = [
      {
        id: 'q1',
        created_at: '2026-08-25T00:00:00Z',
        query_text: 'What is MentorBridge?',
        thread_message_count: 2,
      },
    ]
    mockQuery({ data: rows, error: null })

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ queries: rows })
  })
})
