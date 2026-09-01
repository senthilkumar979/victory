import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useStudentsByPlacements } from './useStudentsByPlacements'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface QueryMocks {
  select: ReturnType<typeof vi.fn>
  neq: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  then: (
    onFulfilled: (value: { data: unknown; error: unknown }) => unknown,
  ) => Promise<unknown>
}

function createQuery(result: { data: unknown; error: unknown }): QueryMocks {
  const query = {
    select: vi.fn(),
    neq: vi.fn(),
    order: vi.fn(),
    then(onFulfilled: (value: { data: unknown; error: unknown }) => unknown) {
      return Promise.resolve(result).then(onFulfilled)
    },
  }
  query.select.mockReturnValue(query)
  query.neq.mockReturnValue(query)
  query.order.mockReturnValue(query)
  return query
}

afterEach(() => {
  cleanup()
})

describe('useStudentsByPlacements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('excludes MentorBridge employees and maps the public placement fields', async () => {
    const query = createQuery({
      data: [
        {
          id: 's1',
          name: 'Ada',
          picture: 'ada.png',
          role: 'Engineer',
          company: 'Acme',
          email: 'ada@example.com',
          batch: '12',
          extra: 'ignored',
        },
      ],
      error: null,
    })
    fromMock.mockReturnValue(query)

    const { result } = renderHook(() => useStudentsByPlacements())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith(
      'id, name, picture, role, company, email, batch',
    )
    expect(query.neq).toHaveBeenCalledWith('company', 'MentorBridge')
    expect(query.order).toHaveBeenNthCalledWith(1, 'batch', { ascending: false })
    expect(query.order).toHaveBeenNthCalledWith(2, 'name', { ascending: true })
    expect(result.current.students).toEqual([
      {
        id: 's1',
        name: 'Ada',
        picture: 'ada.png',
        role: 'Engineer',
        company: 'Acme',
        email: 'ada@example.com',
        batch: '12',
      },
    ])
    expect(result.current.error).toBeNull()
  })

  it('treats a null result set as an empty list', async () => {
    fromMock.mockReturnValue(createQuery({ data: null, error: null }))

    const { result } = renderHook(() => useStudentsByPlacements())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.students).toEqual([])
  })

  it('surfaces a Postgrest-style fetch error as the generic fallback', async () => {
    fromMock.mockReturnValue(
      createQuery({ data: null, error: { message: 'timeout' } }),
    )

    const { result } = renderHook(() => useStudentsByPlacements())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to fetch students')
    expect(result.current.students).toEqual([])
  })
})
