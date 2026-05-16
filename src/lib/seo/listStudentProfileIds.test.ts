import { beforeEach, describe, expect, it, vi } from 'vitest'

const { adminFromMock, clientFromMock, supabaseAdminState } = vi.hoisted(() => ({
  adminFromMock: vi.fn(),
  clientFromMock: vi.fn(),
  supabaseAdminState: {
    current: null as null | { from: ReturnType<typeof vi.fn> },
  },
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return supabaseAdminState.current
  },
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: clientFromMock,
  },
}))

import { listStudentProfileIds } from './listStudentProfileIds'

interface StudentIdsQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function mockStudentIdsQuery(
  result: unknown,
  fromMock = clientFromMock,
): StudentIdsQuery {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

describe('listStudentProfileIds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseAdminState.current = null
  })

  it('queries public student IDs in a deterministic capped order', async () => {
    const query = mockStudentIdsQuery({
      data: [{ id: 'student-a' }, { id: 'student-b' }],
      error: null,
    })

    await expect(listStudentProfileIds()).resolves.toEqual([
      'student-a',
      'student-b',
    ])

    expect(clientFromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith('id')
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5000)
  })

  it('filters empty database IDs before adding public sitemap URLs', async () => {
    mockStudentIdsQuery({
      data: [
        { id: 'student-a' },
        { id: '' },
        { id: null },
        { id: 'student-b' },
      ],
      error: null,
    })

    await expect(listStudentProfileIds()).resolves.toEqual([
      'student-a',
      'student-b',
    ])
  })

  it('prefers the admin client and returns an empty list on query failure', async () => {
    supabaseAdminState.current = { from: adminFromMock }
    mockStudentIdsQuery({ data: null, error: new Error('denied') }, adminFromMock)

    await expect(listStudentProfileIds()).resolves.toEqual([])

    expect(adminFromMock).toHaveBeenCalledWith('students')
    expect(clientFromMock).not.toHaveBeenCalled()
  })
})
