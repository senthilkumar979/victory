import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useStudentsForAttendance } from './useStudentsForAttendance'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface QueryMocks {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  then: (
    onFulfilled: (value: { data: unknown; error: unknown }) => unknown,
  ) => Promise<unknown>
}

function createQuery(result: { data: unknown; error: unknown }): QueryMocks {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    then(onFulfilled: (value: { data: unknown; error: unknown }) => unknown) {
      return Promise.resolve(result).then(onFulfilled)
    },
  }
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  return query
}

const studentRows = [
  {
    id: 's1',
    name: 'Ada',
    picture: 'ada.png',
    batch: 3,
    serial_no: 17,
  },
  {
    id: 's2',
    name: null,
    picture: null,
    batch: null,
    serial_no: 'not-a-number',
  },
]

afterEach(() => {
  cleanup()
})

describe('useStudentsForAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromMock.mockImplementation(() =>
      createQuery({
        data: [{ batch: 3 }, { batch: '' }, { batch: 12 }, { batch: 3 }],
        error: null,
      }),
    )
  })

  it('dedupes cohort options and sorts them numerically descending', async () => {
    const { result } = renderHook(() => useStudentsForAttendance())

    await waitFor(() => expect(result.current.cohortOptions).toEqual(['12', '3']))
    expect(fromMock).toHaveBeenCalledWith('students')
    expect(result.current.students).toEqual([])
  })

  it('maps attendance fields and applies a specific cohort filter', async () => {
    const { result } = renderHook(() => useStudentsForAttendance())
    await waitFor(() => expect(result.current.cohortOptions).toHaveLength(2))

    let latestQuery: QueryMocks | undefined
    fromMock.mockImplementation(() => {
      latestQuery = createQuery({ data: studentRows, error: null })
      return latestQuery
    })

    act(() => {
      result.current.setCohort('3')
    })

    await waitFor(() => expect(result.current.students).toHaveLength(2))

    expect(latestQuery?.select).toHaveBeenCalledWith(
      'id, name, picture, batch, serial_no',
    )
    expect(latestQuery?.order).toHaveBeenNthCalledWith(1, 'serial_no', {
      ascending: true,
    })
    expect(latestQuery?.order).toHaveBeenNthCalledWith(2, 'name', {
      ascending: true,
    })
    expect(latestQuery?.eq).toHaveBeenCalledWith('batch', '3')
    expect(result.current.students).toEqual([
      {
        id: 's1',
        name: 'Ada',
        picture: 'ada.png',
        batch: '3',
        serialNo: 17,
      },
      {
        id: 's2',
        name: '',
        picture: '',
        batch: '',
        serialNo: 0,
      },
    ])
  })

  it('does not filter by batch when the cohort is __all__', async () => {
    const { result } = renderHook(() => useStudentsForAttendance())
    await waitFor(() => expect(result.current.cohortOptions).toHaveLength(2))

    let latestQuery: QueryMocks | undefined
    fromMock.mockImplementation(() => {
      latestQuery = createQuery({ data: studentRows, error: null })
      return latestQuery
    })

    act(() => {
      result.current.setCohort('__all__')
    })

    await waitFor(() => expect(result.current.students).toHaveLength(2))
    expect(latestQuery?.eq).not.toHaveBeenCalled()
  })

  it('surfaces a Postgrest-style fetch error as the generic fallback', async () => {
    const { result } = renderHook(() => useStudentsForAttendance())
    await waitFor(() => expect(result.current.cohortOptions).toHaveLength(2))

    fromMock.mockImplementation(() =>
      createQuery({ data: null, error: { message: 'timeout' } }),
    )

    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.error).toBe('Failed to fetch students')
    expect(result.current.students).toEqual([])
    expect(result.current.loading).toBe(false)
  })
})
