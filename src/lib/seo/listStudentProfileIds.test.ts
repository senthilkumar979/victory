import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listStudentProfileIds } from './listStudentProfileIds'

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

  it('returns ordered non-empty student profile IDs for sitemap generation', async () => {
    const query = mockStudentIdsQuery({
      data: [
        { id: 'student-a' },
        { id: '' },
        { id: null },
        { id: 'student-b' },
        { id: 123 },
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

  it('returns an empty list when Supabase fails or has no rows', async () => {
    mockStudentIdsQuery({ data: null, error: new Error('query failed') })

    await expect(listStudentProfileIds()).resolves.toEqual([])
  })
})
