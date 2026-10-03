import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMeetingStats } from './useMeetingStats'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface QueryCall {
  gte: [string, string] | null
  lte: [string, string] | null
}

type QueryResult = { count: number | null } | Error | string

const calls: QueryCall[] = []
let responses: QueryResult[] = []

function createBuilder(result: QueryResult): PromiseLike<{ count: number | null }> {
  const call: QueryCall = { gte: null, lte: null }
  calls.push(call)
  const builder: PromiseLike<{ count: number | null }> & {
    select: ReturnType<typeof vi.fn>
    gte: ReturnType<typeof vi.fn>
    lte: ReturnType<typeof vi.fn>
  } = {
    select: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    then: (onFulfilled, onRejected) => {
      const settled =
        result instanceof Error || typeof result === 'string'
          ? Promise.reject(result)
          : Promise.resolve(result)
      return settled.then(onFulfilled, onRejected)
    },
  }
  builder.select.mockReturnValue(builder)
  builder.gte.mockImplementation((column: string, value: string) => {
    call.gte = [column, value]
    return builder
  })
  builder.lte.mockImplementation((column: string, value: string) => {
    call.lte = [column, value]
    return builder
  })
  return builder
}

function queueCounts(
  total: number | null,
  month: number | null,
  week: number | null,
): void {
  responses.push({ count: total }, { count: month }, { count: week })
}

function queueFailure(reason: Error | string): void {
  responses.push(reason, reason, reason)
}

function expectLocalDateTime(
  iso: string,
  expected: {
    year: number
    month: number
    day: number
    hours: number
    minutes: number
    seconds: number
    ms: number
  },
): void {
  const date = new Date(iso)
  expect(date.getFullYear()).toBe(expected.year)
  expect(date.getMonth()).toBe(expected.month)
  expect(date.getDate()).toBe(expected.day)
  expect(date.getHours()).toBe(expected.hours)
  expect(date.getMinutes()).toBe(expected.minutes)
  expect(date.getSeconds()).toBe(expected.seconds)
  expect(date.getMilliseconds()).toBe(expected.ms)
}

describe('useMeetingStats', () => {
  beforeEach(() => {
    calls.length = 0
    responses = []
    fromMock.mockReset()
    fromMock.mockImplementation(() => createBuilder(responses.shift() ?? { count: 0 }))
    vi.useFakeTimers({ toFake: ['Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts April in IST when UTC is still March 31', async () => {
    vi.setSystemTime(new Date('2026-03-31T18:30:00.000Z'))
    queueCounts(10, 4, 1)

    const { result } = renderHook(() => useMeetingStats())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledTimes(3)
    expect(fromMock).toHaveBeenCalledWith('meetings')
    expect(calls[1]?.gte).toEqual(['date', '2026-04-01T00:00:00+05:30'])
    expect(calls[1]?.lte).toEqual(['date', '2026-04-30T23:59:59.999+05:30'])
    expect(result.current.totalMeetings).toBe(10)
    expect(result.current.meetingsThisMonth).toBe(4)
    expect(result.current.meetingsThisWeek).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('keeps January bounds one second before the IST month rollover', async () => {
    vi.setSystemTime(new Date('2026-01-31T18:29:59.000Z'))
    queueCounts(1, 2, 3)

    const { result } = renderHook(() => useMeetingStats())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(calls[1]?.gte).toEqual(['date', '2026-01-01T00:00:00+05:30'])
    expect(calls[1]?.lte).toEqual(['date', '2026-01-31T23:59:59.999+05:30'])
  })

  it('uses February 29 on a leap year and December 31 at year end', async () => {
    vi.setSystemTime(new Date('2024-02-15T06:30:00.000Z'))
    queueCounts(1, 1, 1)
    const { result, unmount } = renderHook(() => useMeetingStats())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(calls[1]?.lte).toEqual(['date', '2024-02-29T23:59:59.999+05:30'])
    unmount()

    calls.length = 0
    vi.setSystemTime(new Date('2026-12-15T06:30:00.000Z'))
    queueCounts(1, 1, 1)
    const next = renderHook(() => useMeetingStats())
    await waitFor(() => expect(next.result.current.isLoading).toBe(false))
    expect(calls[1]?.gte).toEqual(['date', '2026-12-01T00:00:00+05:30'])
    expect(calls[1]?.lte).toEqual(['date', '2026-12-31T23:59:59.999+05:30'])
  })

  it('queries Monday through Sunday and crosses into the previous month', async () => {
    vi.setSystemTime(new Date('2026-01-04T06:30:00.000Z'))
    queueCounts(8, 3, 2)

    const { result } = renderHook(() => useMeetingStats())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(calls[2]?.gte?.[0]).toBe('date')
    expect(calls[2]?.lte?.[0]).toBe('date')
    expectLocalDateTime(calls[2]?.gte?.[1] ?? '', {
      year: 2025,
      month: 11,
      day: 29,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ms: 0,
    })
    expectLocalDateTime(calls[2]?.lte?.[1] ?? '', {
      year: 2026,
      month: 0,
      day: 4,
      hours: 23,
      minutes: 59,
      seconds: 59,
      ms: 999,
    })
  })

  it('treats an unrecognized weekday as Monday', async () => {
    vi.setSystemTime(new Date('2026-01-04T06:30:00.000Z'))
    const RealDateTimeFormat = Intl.DateTimeFormat
    const dateTimeSpy = vi
      .spyOn(Intl, 'DateTimeFormat')
      .mockImplementation(function DateTimeFormat(
        locales?: Intl.LocalesArgument,
        options?: Intl.DateTimeFormatOptions,
      ) {
        const real = new RealDateTimeFormat(locales, options)
        return {
          formatToParts: (date?: Date | number) =>
            real
              .formatToParts(date)
              .map((part) =>
                part.type === 'weekday' ? { ...part, value: 'Holiday' } : part,
              ),
          format: (date?: Date | number) => real.format(date),
          resolvedOptions: () => real.resolvedOptions(),
        } as Intl.DateTimeFormat
      })
    queueCounts(1, 1, 1)

    try {
      const { result } = renderHook(() => useMeetingStats())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(calls[1]?.gte).toEqual(['date', '2026-01-01T00:00:00+05:30'])
      expectLocalDateTime(calls[2]?.gte?.[1] ?? '', {
        year: 2026,
        month: 0,
        day: 4,
        hours: 0,
        minutes: 0,
        seconds: 0,
        ms: 0,
      })
      expectLocalDateTime(calls[2]?.lte?.[1] ?? '', {
        year: 2026,
        month: 0,
        day: 10,
        hours: 23,
        minutes: 59,
        seconds: 59,
        ms: 999,
      })
    } finally {
      dateTimeSpy.mockRestore()
    }
  })

  it('turns null counts into zero', async () => {
    vi.setSystemTime(new Date('2026-04-06T00:30:00.000Z'))
    queueCounts(null, null, null)

    const { result } = renderHook(() => useMeetingStats())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.totalMeetings).toBe(0)
    expect(result.current.meetingsThisMonth).toBe(0)
    expect(result.current.meetingsThisWeek).toBe(0)
  })

  it('surfaces Error messages and a fallback for non-Error failures', async () => {
    vi.setSystemTime(new Date('2026-04-06T00:30:00.000Z'))
    queueFailure(new Error('meetings unavailable'))

    const { result } = renderHook(() => useMeetingStats())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('meetings unavailable')

    queueFailure('offline')
    await result.current.refetch()
    await waitFor(() => expect(result.current.error).toBe('Failed to fetch meeting stats'))
    expect(result.current.isLoading).toBe(false)
  })

  it('keeps the last counts when a later fetch fails', async () => {
    vi.setSystemTime(new Date('2026-04-06T00:30:00.000Z'))
    queueCounts(9, 4, 2)

    const { result } = renderHook(() => useMeetingStats())
    await waitFor(() => expect(result.current.totalMeetings).toBe(9))

    queueFailure(new Error('timeout'))
    await result.current.refetch()
    await waitFor(() => expect(result.current.error).toBe('timeout'))

    expect(result.current.totalMeetings).toBe(9)
    expect(result.current.meetingsThisMonth).toBe(4)
    expect(result.current.meetingsThisWeek).toBe(2)
  })
})
