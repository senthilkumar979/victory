import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listStudentProfileIds } from './listStudentProfileIds'

const { publicFromMock, adminFromMock, state } = vi.hoisted(() => ({
  publicFromMock: vi.fn(),
  adminFromMock: vi.fn(),
  state: {
    hasAdminClient: false,
  },
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: publicFromMock,
  },
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return state.hasAdminClient
      ? {
          from: adminFromMock,
        }
      : null
  },
}))

interface StudentIdQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function mockStudentIdQuery(
  fromMock: ReturnType<typeof vi.fn>,
  result: unknown,
): StudentIdQuery {
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
    state.hasAdminClient = false
  })

  it('returns only non-empty string ids from the public client query', async () => {
    const query = mockStudentIdQuery(publicFromMock, {
      data: [
        { id: 'student-b' },
        { id: '' },
        { id: null },
        { id: 'student-a' },
      ],
      error: null,
    })

    await expect(listStudentProfileIds()).resolves.toEqual([
      'student-b',
      'student-a',
    ])

    expect(publicFromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith('id')
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5000)
  })

  it('prefers the admin client when available for server-side sitemap reads', async () => {
    state.hasAdminClient = true
    mockStudentIdQuery(adminFromMock, {
      data: [{ id: 'service-role-student' }],
      error: null,
    })

    await expect(listStudentProfileIds()).resolves.toEqual([
      'service-role-student',
    ])

    expect(adminFromMock).toHaveBeenCalledWith('students')
    expect(publicFromMock).not.toHaveBeenCalled()
  })

  it('returns an empty list when Supabase reports an error', async () => {
    mockStudentIdQuery(publicFromMock, {
      data: [{ id: 'student-a' }],
      error: new Error('permission denied'),
    })

    await expect(listStudentProfileIds()).resolves.toEqual([])
  })
})
