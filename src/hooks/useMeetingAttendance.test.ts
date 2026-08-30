import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMeetingAttendance } from './useMeetingAttendance'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

function mockAttendanceQuery(result: { data?: unknown; error?: unknown }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue(result),
    update: vi.fn(),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.update.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

afterEach(() => {
  cleanup()
})

describe('useMeetingAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('does not query when attendance is hidden or the meeting id is empty', async () => {
    const hidden = renderHook(() => useMeetingAttendance(true))
    await expect(hidden.result.current.fetchAttendance('meeting-1')).resolves.toEqual(
      [],
    )
    expect(fromMock).not.toHaveBeenCalled()

    const visible = renderHook(() => useMeetingAttendance(false))
    await expect(visible.result.current.fetchAttendance('')).resolves.toEqual([])
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('coerces and sorts attendance serial numbers', async () => {
    const query = mockAttendanceQuery({
      data: { attendance: ['12', 3, '7'] },
      error: null,
    })

    const { result } = renderHook(() => useMeetingAttendance(false))
    let fetched: number[] = []
    await act(async () => {
      fetched = await result.current.fetchAttendance('meeting-1')
    })

    expect(fromMock).toHaveBeenCalledWith('meetings')
    expect(query.select).toHaveBeenCalledWith('attendance')
    expect(query.eq).toHaveBeenCalledWith('id', 'meeting-1')
    expect(fetched).toEqual([3, 7, 12])
    expect(result.current.attendance).toEqual([3, 7, 12])
    expect(result.current.error).toBeNull()
  })

  it('surfaces fetch errors and returns an empty list', async () => {
    mockAttendanceQuery({
      data: null,
      error: { message: 'permission denied' },
    })

    const { result } = renderHook(() => useMeetingAttendance())
    let fetched: number[] = []
    await act(async () => {
      fetched = await result.current.fetchAttendance('meeting-1')
    })

    expect(fetched).toEqual([])
    expect(result.current.attendance).toEqual([])
    expect(result.current.error).toBe('Failed to fetch attendance')
  })

  it('sorts saved attendance and rethrows update failures', async () => {
    const query = mockAttendanceQuery({ data: null, error: null })
    const { result } = renderHook(() => useMeetingAttendance())

    await act(async () => {
      await result.current.updateAttendance('meeting-1', [9, 2, 4])
    })

    expect(query.update).toHaveBeenCalledWith({ attendance: [9, 2, 4] })
    expect(result.current.attendance).toEqual([2, 4, 9])

    query.eq.mockResolvedValueOnce({ error: new Error('write failed') })

    await act(async () => {
      await expect(
        result.current.updateAttendance('meeting-1', [1]),
      ).rejects.toThrow('write failed')
    })
    expect(result.current.error).toBe('write failed')
  })
})
