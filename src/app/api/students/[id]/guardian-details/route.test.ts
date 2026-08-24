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

const studentId = 'stu-1'
const routeContext = { params: Promise.resolve({ id: studentId }) }

function mockDb(result: {
  data: Record<string, unknown> | null
  error: { message: string } | null
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  dbState.client = { from }
  return { from, select, eq, maybeSingle }
}

describe('GET /api/students/[id]/guardian-details', () => {
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

    const response = await GET(new Request('http://localhost/guardian'), routeContext)

    expect(response.status).toBe(403)
    expect((dbState.client as { from: ReturnType<typeof vi.fn> }).from).not.toHaveBeenCalled()
  })

  it('returns 503 when the admin database client is missing', async () => {
    dbState.client = null

    const response = await GET(new Request('http://localhost/guardian'), routeContext)

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Server database is not configured.',
    })
  })

  it('maps query failures to 500 and missing students to 404', async () => {
    mockDb({ data: null, error: { message: 'db down' } })
    const failed = await GET(new Request('http://localhost/guardian'), routeContext)
    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toEqual({
      error: 'Could not load guardian details.',
    })

    mockDb({ data: null, error: null })
    const missing = await GET(new Request('http://localhost/guardian'), routeContext)
    expect(missing.status).toBe(404)
    await expect(missing.json()).resolves.toEqual({ error: 'Student not found.' })
  })

  it('returns guardian fields and coercing nulls to empty strings', async () => {
    const { select, eq } = mockDb({
      data: { father_guardian_details: 'Father', mother_details: null },
      error: null,
    })

    const response = await GET(new Request('http://localhost/guardian'), routeContext)

    expect(select).toHaveBeenCalledWith('father_guardian_details, mother_details')
    expect(eq).toHaveBeenCalledWith('id', studentId)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      fatherGuardianDetails: 'Father',
      motherDetails: '',
    })
  })
})
