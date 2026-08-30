import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useStudentsWithFilters } from './useStudentsWithFilters'

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
  ilike: ReturnType<typeof vi.fn>
  or: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  then: (onFulfilled: (value: { data: unknown; error: unknown }) => unknown) => Promise<unknown>
}

function createQuery(result: { data: unknown; error: unknown }): QueryMocks {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    ilike: vi.fn(),
    or: vi.fn(),
    eq: vi.fn(),
    then(onFulfilled: (value: { data: unknown; error: unknown }) => unknown) {
      return Promise.resolve(result).then(onFulfilled)
    },
  }
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  query.ilike.mockReturnValue(query)
  query.or.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  return query
}

const studentRows = [
  {
    id: '1',
    name: 'Ada',
    picture: 'a.png',
    role: 'Engineer',
    company: 'Acme',
    email: 'ada@example.com',
    social_links: '{"linkedIn":"https://in.example"}',
    batch: 3,
    cohort_id: 'c1',
    gender: '  F  ',
  },
  {
    id: '2',
    name: 'Lin',
    picture: 'l.png',
    role: 'Designer',
    company: 'Acme',
    email: 'lin@example.com',
    social_links: 'not-json',
    batch: 2,
    gender: '   ',
  },
]

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useStudentsWithFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          cohorts: [{ id: 'c1', name: 'Batch 3' }],
        }),
      }),
    )
    fromMock.mockImplementation(() =>
      createQuery({ data: studentRows, error: null }),
    )
  })

  it('maps gender, parses social links, and builds unique filter options', async () => {
    const { result } = renderHook(() => useStudentsWithFilters())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.students[0]).toEqual(
      expect.objectContaining({
        gender: 'F',
        socialLinks: { linkedIn: 'https://in.example' },
        batch: '3',
        cohortId: 'c1',
      }),
    )
    expect(result.current.students[1].gender).toBeUndefined()
    expect(result.current.students[1].socialLinks).toEqual({})
    expect(result.current.filterOptions).toEqual({
      cohorts: [{ id: 'c1', name: 'Batch 3' }],
      companies: ['Acme'],
      roles: ['Designer', 'Engineer'],
    })
  })

  it('applies name search and a known cohort as an or-filter', async () => {
    const { result } = renderHook(() => useStudentsWithFilters())
    await waitFor(() => expect(result.current.filterOptions.cohorts).toHaveLength(1))

    let latestQuery: QueryMocks | undefined
    fromMock.mockImplementation(() => {
      latestQuery = createQuery({ data: studentRows, error: null })
      return latestQuery
    })

    act(() => {
      result.current.setFilters({
        cohort: 'c1',
        company: 'Acme',
        role: 'Engineer',
        nameSearch: '  Ada  ',
      })
    })

    await waitFor(() => expect(latestQuery?.ilike).toHaveBeenCalled())
    expect(latestQuery?.ilike).toHaveBeenCalledWith('name', '%Ada%')
    expect(latestQuery?.or).toHaveBeenCalledWith(
      'cohort_id.eq.c1,batch.eq.Batch 3',
    )
    expect(latestQuery?.eq).toHaveBeenCalledWith('company', 'Acme')
    expect(latestQuery?.eq).toHaveBeenCalledWith('role', 'Engineer')
  })

  it('falls back to cohort_id equality when the option is unknown', async () => {
    const { result } = renderHook(() => useStudentsWithFilters())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let latestQuery: QueryMocks | undefined
    fromMock.mockImplementation(() => {
      latestQuery = createQuery({ data: [], error: null })
      return latestQuery
    })

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, cohort: 'missing' }))
    })

    await waitFor(() =>
      expect(latestQuery?.eq).toHaveBeenCalledWith('cohort_id', 'missing'),
    )
    expect(latestQuery?.or).not.toHaveBeenCalled()
  })

  it('surfaces a fetch error without throwing', async () => {
    fromMock.mockImplementation(() =>
      createQuery({ data: null, error: { message: 'timeout' } }),
    )

    const { result } = renderHook(() => useStudentsWithFilters())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch students')
    expect(result.current.students).toEqual([])
  })
})
