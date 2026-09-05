import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMeetingStats } from './useMeetingStats'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface CountQuery {
  select: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  lte: ReturnType<typeof vi.fn>
  then: (
    onFulfilled?: (value: { count: number | null }) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise<unknown>
}

function mockCountQuery(
  result: { count: number | null } | { rejectWith: unknown },
): CountQuery {
  const query = {
    select: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    then: (
      onFulfilled?: (value: { count: number | null }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) =>
      'rejectWith' in result
        ? Promise.reject(result.rejectWith).then(onFulfilled, onRejected)
        : Promise.resolve(result).then(onFulfilled, onRejected),
  }
  query.select.mockReturnValue(query)
  query.gte.mockReturnValue(query)
  query.lte.mockReturnValue(query)
  fromMock.mockReturnValueOnce(query)
  return query
}

describe('useMeetingStats', () => {
  beforeEach(() => {
    fromMock.mockReset()
  })

  it('treats null counts as zero and filters month/week by date', async () => {
    const total = mockCountQuery({ count: null })
    const month = mockCountQuery({ count: 4 })
    const week = mockCountQuery({ count: 2 })

    const { result } = renderHook(() => useMeetingStats())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('meetings')
    expect(fromMock).toHaveBeenCalledTimes(3)
    expect(total.gte).not.toHaveBeenCalled()
    expect(month.gte).toHaveBeenCalledWith('date', expect.any(String))
    expect(month.lte).toHaveBeenCalledWith('date', expect.any(String))
    expect(week.gte).toHaveBeenCalledWith('date', expect.any(String))
    expect(week.lte).toHaveBeenCalledWith('date', expect.any(String))
    expect(result.current.totalMeetings).toBe(0)
    expect(result.current.meetingsThisMonth).toBe(4)
    expect(result.current.meetingsThisWeek).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it('maps thrown Errors and non-Error rejects to user-facing messages', async () => {
    mockCountQuery({ rejectWith: new Error('timeout') })
    mockCountQuery({ count: 1 })
    mockCountQuery({ count: 1 })

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result, rerender } = renderHook(() => useMeetingStats())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('timeout')

    fromMock.mockReset()
    mockCountQuery({ rejectWith: { message: 'postgrest' } })
    mockCountQuery({ count: 0 })
    mockCountQuery({ count: 0 })
    await result.current.refetch()
    rerender()

    await waitFor(() =>
      expect(result.current.error).toBe('Failed to fetch meeting stats'),
    )
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
