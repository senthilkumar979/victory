import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStudentsByPlacements } from './useStudentsByPlacements'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface StudentsQuery {
  select: ReturnType<typeof vi.fn>
  neq: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
}

function mockStudentsQuery(result: unknown): StudentsQuery {
  const query: StudentsQuery = {
    select: vi.fn(),
    neq: vi.fn(),
    order: vi.fn(),
  }
  query.select.mockReturnValue(query)
  query.neq.mockReturnValue(query)
  query.order.mockReturnValueOnce(query).mockResolvedValueOnce(result)
  fromMock.mockReturnValue(query)
  return query
}

describe('useStudentsByPlacements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads placed students and leaves out internal MentorBridge rows', async () => {
    const query = mockStudentsQuery({
      data: [
        {
          id: 'student-1',
          name: 'Ada Lovelace',
          picture: 'https://img.example.com/ada.png',
          role: 'Engineer',
          company: 'Analytical Engines',
          email: 'ada@example.com',
          batch: '2026',
          father_guardian_details: 'should not leak',
        },
      ],
      error: null,
    })

    const { result } = renderHook(() => useStudentsByPlacements())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith(
      'id, name, picture, role, company, email, batch',
    )
    expect(query.neq).toHaveBeenCalledWith('company', 'MentorBridge')
    expect(query.order).toHaveBeenNthCalledWith(1, 'batch', { ascending: false })
    expect(query.order).toHaveBeenNthCalledWith(2, 'name', { ascending: true })
    expect(result.current.error).toBeNull()
    expect(result.current.students).toEqual([
      {
        id: 'student-1',
        name: 'Ada Lovelace',
        picture: 'https://img.example.com/ada.png',
        role: 'Engineer',
        company: 'Analytical Engines',
        email: 'ada@example.com',
        batch: '2026',
      },
    ])
  })

  it('treats a null result as an empty placement list', async () => {
    mockStudentsQuery({ data: null, error: null })

    const { result } = renderHook(() => useStudentsByPlacements())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.students).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('uses a generic message when the database error is not an Error', async () => {
    mockStudentsQuery({
      data: null,
      error: { message: 'permission denied for table students' },
    })

    const { result } = renderHook(() => useStudentsByPlacements())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.students).toEqual([])
    expect(result.current.error).toBe('Failed to fetch students')
  })

  it('surfaces Error messages from a failed request', async () => {
    const query: StudentsQuery = {
      select: vi.fn(),
      neq: vi.fn(),
      order: vi.fn(),
    }
    query.select.mockReturnValue(query)
    query.neq.mockReturnValue(query)
    query.order
      .mockReturnValueOnce(query)
      .mockRejectedValueOnce(new Error('network down'))
    fromMock.mockReturnValue(query)

    const { result } = renderHook(() => useStudentsByPlacements())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.students).toEqual([])
    expect(result.current.error).toBe('network down')
  })
})
