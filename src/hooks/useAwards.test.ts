import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAwards } from './useAwards'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface AwardsListQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  then: (
    onFulfilled: (value: { data: unknown; error: unknown }) => unknown,
  ) => Promise<unknown>
}

function createAwardsListQuery(result: {
  data: unknown
  error: unknown
}): AwardsListQuery {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    then(onFulfilled: (value: { data: unknown; error: unknown }) => unknown) {
      return Promise.resolve(result).then(onFulfilled)
    },
  }
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  return query
}

interface StudentsQuery {
  select: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
}

function createStudentsQuery(result: { data: unknown; error?: unknown }): StudentsQuery {
  const query = {
    select: vi.fn(),
    in: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  return query
}

interface InsertQuery {
  insert: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
}

function createInsertQuery(result: { data: unknown; error: unknown }): InsertQuery {
  const query = {
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn().mockResolvedValue(result),
  }
  query.insert.mockReturnValue(query)
  query.select.mockReturnValue(query)
  return query
}

const awardRows = [
  {
    id: 'aw1',
    awarded_to: 'ada@example.com',
    awarded_on: '2026-03-01',
    description: 'Outstanding',
    award_category_id: 'cat-1',
  },
  {
    id: 'aw2',
    awarded_to: 'ada@example.com',
    awarded_on: '2026-02-01',
    description: 'Repeat',
    award_category_id: null,
  },
  {
    id: 'aw3',
    awarded_to: 'unknown@example.com',
    awarded_on: '2026-01-01',
    description: 'Orphan',
    award_category_id: '',
  },
]

afterEach(() => {
  cleanup()
})

describe('useAwards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('enriches awards by unique email and leaves unmatched recipients without a student', async () => {
    const awardsQuery = createAwardsListQuery({ data: awardRows, error: null })
    const studentsQuery = createStudentsQuery({
      data: [
        {
          email: 'ada@example.com',
          name: 'Ada',
          picture: 'ada.png',
          batch: '12',
        },
      ],
    })
    fromMock.mockImplementation((table: string) => {
      if (table === 'awards') return awardsQuery
      return studentsQuery
    })

    const { result } = renderHook(() => useAwards())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(awardsQuery.select).toHaveBeenCalledWith(
      'id, awarded_to, awarded_on, description, award_category_id',
    )
    expect(awardsQuery.order).toHaveBeenCalledWith('awarded_on', {
      ascending: false,
    })
    expect(studentsQuery.in).toHaveBeenCalledWith('email', [
      'ada@example.com',
      'unknown@example.com',
    ])
    expect(result.current.awards).toEqual([
      expect.objectContaining({
        id: 'aw1',
        awardedTo: 'ada@example.com',
        awardCategoryId: 'cat-1',
        student: { name: 'Ada', picture: 'ada.png', batch: '12' },
      }),
      expect.objectContaining({
        id: 'aw2',
        student: { name: 'Ada', picture: 'ada.png', batch: '12' },
      }),
      expect.objectContaining({
        id: 'aw3',
        awardedTo: 'unknown@example.com',
        awardCategoryId: '',
        student: undefined,
      }),
    ])
  })

  it('skips the student lookup when there are no awards', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'awards') return createAwardsListQuery({ data: [], error: null })
      throw new Error(`unexpected table ${table}`)
    })

    const { result } = renderHook(() => useAwards())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.awards).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('stores an empty award category as null and throws when create returns no id', async () => {
    const awardsQuery = createAwardsListQuery({ data: [], error: null })
    const insertQuery = createInsertQuery({ data: {}, error: null })
    fromMock
      .mockReturnValueOnce(awardsQuery)
      .mockReturnValueOnce(insertQuery)

    const { result } = renderHook(() => useAwards())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      result.current.createAward({
        awardedTo: 'ada@example.com',
        awardedOn: '2026-03-15',
        description: 'Winner',
        awardCategoryId: '',
      }),
    ).rejects.toThrow('Award created but no id returned')

    expect(insertQuery.insert).toHaveBeenCalledWith({
      awarded_to: 'ada@example.com',
      awarded_on: '2026-03-15',
      description: 'Winner',
      award_category_id: null,
    })
  })

  it('surfaces a Postgrest-style fetch error as the generic fallback', async () => {
    fromMock.mockReturnValue(
      createAwardsListQuery({ data: null, error: { message: 'timeout' } }),
    )

    const { result } = renderHook(() => useAwards())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch awards')
    expect(result.current.awards).toEqual([])
  })
})
