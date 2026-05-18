import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listStudentProfileIds } from './listStudentProfileIds'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: null }))
vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: fromMock } }))

function mockStudentIdQuery(result: unknown) {
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

  it('returns only non-empty string ids for public student profile URLs', async () => {
    const query = mockStudentIdQuery({
      data: [{ id: 'student-a' }, { id: '' }, { id: null }, { id: 'student-b' }],
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

  it('returns an empty list when the student id query fails', async () => {
    mockStudentIdQuery({ data: null, error: { message: 'permission denied' } })

    await expect(listStudentProfileIds()).resolves.toEqual([])
  })
})
