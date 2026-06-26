import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listStudentProfileIds } from '@/lib/seo/listStudentProfileIds'

const { adminFromMock, clientFromMock, dbState } = vi.hoisted(() => {
  const adminFromMock = vi.fn()
  const clientFromMock = vi.fn()

  return {
    adminFromMock,
    clientFromMock,
    dbState: {
      admin: { from: adminFromMock },
      client: { from: clientFromMock },
    },
  }
})

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.admin
  },
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return dbState.client
  },
}))

interface StudentIdsQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function mockStudentIdsQuery(result: unknown): StudentIdsQuery {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  adminFromMock.mockReturnValue(query)
  clientFromMock.mockReturnValue(query)

  return query
}

describe('listStudentProfileIds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.admin = { from: adminFromMock }
  })

  it('queries the admin client for bounded, sorted public profile ids', async () => {
    const query = mockStudentIdsQuery({
      data: [{ id: 'ada' }, { id: null }, { id: '' }, { id: 'grace' }],
      error: null,
    })

    await expect(listStudentProfileIds()).resolves.toEqual(['ada', 'grace'])

    expect(adminFromMock).toHaveBeenCalledWith('students')
    expect(clientFromMock).not.toHaveBeenCalled()
    expect(query.select).toHaveBeenCalledWith('id')
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5000)
  })

  it('falls back to the public client when the admin client is unavailable', async () => {
    dbState.admin = null
    mockStudentIdsQuery({
      data: [{ id: 'public-student' }],
      error: null,
    })

    await expect(listStudentProfileIds()).resolves.toEqual(['public-student'])

    expect(adminFromMock).not.toHaveBeenCalled()
    expect(clientFromMock).toHaveBeenCalledWith('students')
  })

  it('returns an empty list when Supabase errors or returns no rows', async () => {
    mockStudentIdsQuery({ data: null, error: new Error('unavailable') })

    await expect(listStudentProfileIds()).resolves.toEqual([])

    mockStudentIdsQuery({ data: [], error: null })

    await expect(listStudentProfileIds()).resolves.toEqual([])
  })
})
