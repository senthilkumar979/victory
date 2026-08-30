import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useStudentsBySerialNumbers } from './useStudentsBySerialNumbers'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

function mockStudentQuery(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(),
    in: vi.fn(),
    order: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.in.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

afterEach(() => {
  cleanup()
})

describe('useStudentsBySerialNumbers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips the query when attendance is hidden or every serial is invalid', async () => {
    const hidden = renderHook(() => useStudentsBySerialNumbers(true))
    await act(async () => {
      await hidden.result.current.fetchStudents([1, 2])
    })
    expect(fromMock).not.toHaveBeenCalled()
    expect(hidden.result.current.students).toEqual([])

    const visible = renderHook(() => useStudentsBySerialNumbers(false))
    await act(async () => {
      await visible.result.current.fetchStudents([0, -4])
    })
    expect(fromMock).not.toHaveBeenCalled()
    expect(visible.result.current.students).toEqual([])
  })

  it('queries only positive serials and maps numeric fields', async () => {
    const query = mockStudentQuery({
      data: [
        {
          id: 's1',
          name: 'Ada',
          picture: null,
          batch: 3,
          serial_no: '12',
        },
      ],
      error: null,
    })

    const { result } = renderHook(() => useStudentsBySerialNumbers())
    await act(async () => {
      await result.current.fetchStudents([12, 0, -1])
    })

    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.in).toHaveBeenCalledWith('serial_no', [12])
    expect(result.current.students).toEqual([
      {
        id: 's1',
        name: 'Ada',
        picture: '',
        batch: '3',
        serialNo: 12,
      },
    ])
  })

  it('clears students when the lookup fails', async () => {
    mockStudentQuery({
      data: [{ id: 'stale' }],
      error: { message: 'rlS blocked' },
    })

    const { result } = renderHook(() => useStudentsBySerialNumbers())
    await act(async () => {
      await result.current.fetchStudents([4])
    })

    expect(result.current.students).toEqual([])
    expect(result.current.error).toBe('Failed to fetch students')
  })
})
