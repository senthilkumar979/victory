import { beforeEach, describe, expect, it, vi } from 'vitest'

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

import { listStudentProfileIds } from './listStudentProfileIds'

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
  fromMock.mockReturnValue(query)
  return query
}

describe('listStudentProfileIds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns ordered non-empty string ids for public student profile URLs', async () => {
    const query = mockStudentIdsQuery({
      data: [
        { id: 'student-a' },
        { id: null },
        { id: '' },
        { id: 'student-b' },
      ],
      error: null,
    })

    await expect(listStudentProfileIds()).resolves.toEqual([
      'student-a',
      'student-b',
    ])

    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith('id')
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5000)
  })

  it('returns an empty list when Supabase errors', async () => {
    mockStudentIdsQuery({ data: null, error: new Error('network failed') })

    await expect(listStudentProfileIds()).resolves.toEqual([])
  })
})
