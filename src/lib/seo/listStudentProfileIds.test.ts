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

interface StudentIdQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function mockStudentIdQuery(result: unknown): StudentIdQuery {
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

  it('queries sitemap-safe student IDs in a stable capped order', async () => {
    const query = mockStudentIdQuery({
      data: [
        { id: 'student-1' },
        { id: '' },
        { id: null },
        { id: 'student-2' },
      ],
      error: null,
    })

    await expect(listStudentProfileIds()).resolves.toEqual([
      'student-1',
      'student-2',
    ])
    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith('id')
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5000)
  })

  it('returns no IDs when Supabase fails or has no rows', async () => {
    mockStudentIdQuery({ data: null, error: new Error('offline') })
    await expect(listStudentProfileIds()).resolves.toEqual([])

    mockStudentIdQuery({ data: [], error: null })
    await expect(listStudentProfileIds()).resolves.toEqual([])
  })
})
