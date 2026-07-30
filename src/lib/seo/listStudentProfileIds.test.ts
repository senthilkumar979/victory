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

interface ProfileIdQueryResult {
  data: { id: string | null }[] | null
  error: Error | null
}

function mockProfileIdQuery(result: ProfileIdQueryResult) {
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

  it('returns an empty list when Supabase errors', async () => {
    mockProfileIdQuery({ data: null, error: new Error('network failed') })

    await expect(listStudentProfileIds()).resolves.toEqual([])
  })

  it('orders and limits public profile ids while filtering invalid rows', async () => {
    const query = mockProfileIdQuery({
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
    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith('id')
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5000)
  })
})
