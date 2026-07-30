import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listStudentProfileIds } from './listStudentProfileIds'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: null,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: fromMock },
}))

interface StudentIdQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function mockStudentIdQuery(result: unknown): StudentIdQuery {
  const query: StudentIdQuery = {
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

  it('queries public student ids in stable order with the sitemap cap', async () => {
    const query = mockStudentIdQuery({
      data: [{ id: 'student-1' }, { id: '' }, { id: null }, { id: 'student-2' }],
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

  it('returns an empty list when Supabase returns an error', async () => {
    mockStudentIdQuery({ data: null, error: new Error('RLS denied') })

    await expect(listStudentProfileIds()).resolves.toEqual([])
  })
})
