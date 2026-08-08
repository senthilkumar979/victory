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

  it('filters out invalid profile ids from sitemap data', async () => {
    const query = mockStudentIdsQuery({
      data: [{ id: 'ada' }, { id: null }, { id: '' }, { id: 'grace' }],
      error: null,
    })

    await expect(listStudentProfileIds()).resolves.toEqual(['ada', 'grace'])
    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5000)
  })

  it('returns an empty list when the sitemap query fails', async () => {
    mockStudentIdsQuery({ data: null, error: new Error('database unavailable') })

    await expect(listStudentProfileIds()).resolves.toEqual([])
  })
})
