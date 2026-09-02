import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useHallOfFame } from './useHallOfFame'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface ListQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
}

function createListQuery(result: { data: unknown; error: unknown }): ListQuery & {
  then: (
    onFulfilled: (value: { data: unknown; error: unknown }) => unknown,
  ) => Promise<unknown>
} {
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

function createStudentsQuery(result: { data: unknown }) {
  const query = {
    select: vi.fn(),
    in: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  return query
}

function createHofMutations(options?: {
  insert?: { error: unknown }
  delete?: { error: unknown }
}) {
  const deleteEq = vi.fn().mockResolvedValue(options?.delete ?? { error: null })
  return {
    insert: vi.fn().mockResolvedValue(options?.insert ?? { error: null }),
    delete: vi.fn().mockReturnValue({ eq: deleteEq }),
    deleteEq,
  }
}

const hofRows = [
  {
    id: 'hof-1',
    student_email: 'ada@example.com',
    date_of_induction: '2026-03-01',
    created_at: '2026-03-02T00:00:00Z',
  },
  {
    id: 'hof-2',
    student_email: 'ada@example.com',
    date_of_induction: '2025-01-01',
  },
  {
    id: 'hof-3',
    student_email: 'unknown@example.com',
    date_of_induction: '2024-06-01',
  },
]

afterEach(() => {
  cleanup()
})

describe('useHallOfFame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('enriches unique emails and leaves unmatched inductees without a student', async () => {
    const listQuery = createListQuery({ data: hofRows, error: null })
    const studentsQuery = createStudentsQuery({
      data: [
        {
          id: 'st-1',
          email: 'ada@example.com',
          name: 'Ada',
          picture: 'ada.png',
          batch: '12',
          role: 'Engineer',
          company: 'Acme',
        },
      ],
    })
    fromMock.mockImplementation((table: string) => {
      if (table === 'hall_of_fame') return listQuery
      return studentsQuery
    })

    const { result } = renderHook(() => useHallOfFame())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(listQuery.select).toHaveBeenCalledWith(
      'id, student_email, date_of_induction, created_at',
    )
    expect(listQuery.order).toHaveBeenCalledWith('date_of_induction', {
      ascending: false,
    })
    expect(studentsQuery.in).toHaveBeenCalledWith('email', [
      'ada@example.com',
      'unknown@example.com',
    ])
    expect(result.current.entries).toEqual([
      expect.objectContaining({
        id: 'hof-1',
        student: {
          id: 'st-1',
          name: 'Ada',
          picture: 'ada.png',
          batch: '12',
          role: 'Engineer',
          company: 'Acme',
        },
      }),
      expect.objectContaining({
        id: 'hof-2',
        student: expect.objectContaining({ name: 'Ada' }),
      }),
      expect.objectContaining({
        id: 'hof-3',
        student_email: 'unknown@example.com',
        student: undefined,
      }),
    ])
  })

  it('skips the student lookup when there are no hall of fame rows', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'hall_of_fame')
        return createListQuery({ data: [], error: null })
      throw new Error(`unexpected table ${table}`)
    })

    const { result } = renderHook(() => useHallOfFame())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.entries).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('strips the time portion from induction dates before insert', async () => {
    const listQuery = createListQuery({ data: [], error: null })
    const mutations = createHofMutations()
    fromMock.mockImplementation((table: string) => {
      if (table === 'hall_of_fame') return { ...listQuery, ...mutations }
      throw new Error(`unexpected table ${table}`)
    })

    const { result } = renderHook(() => useHallOfFame())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await result.current.createEntry({
      student_email: 'ada@example.com',
      date_of_induction: '2026-03-15T10:30:00.000Z',
    })

    expect(mutations.insert).toHaveBeenCalledWith({
      student_email: 'ada@example.com',
      date_of_induction: '2026-03-15',
    })
  })

  it('keeps a date-only induction value and surfaces Postgrest create errors', async () => {
    const listQuery = createListQuery({ data: [], error: null })
    const mutations = createHofMutations({
      insert: { error: { message: 'duplicate' } },
    })
    fromMock.mockImplementation((table: string) => {
      if (table === 'hall_of_fame') return { ...listQuery, ...mutations }
      throw new Error(`unexpected table ${table}`)
    })

    const { result } = renderHook(() => useHallOfFame())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      result.current.createEntry({
        student_email: 'ada@example.com',
        date_of_induction: '2026-03-15',
      }),
    ).rejects.toEqual({ message: 'duplicate' })

    expect(mutations.insert).toHaveBeenCalledWith({
      student_email: 'ada@example.com',
      date_of_induction: '2026-03-15',
    })
    await waitFor(() =>
      expect(result.current.error).toBe('Failed to create hall of fame entry'),
    )
  })

  it('surfaces a Postgrest-style fetch error as the generic fallback', async () => {
    fromMock.mockReturnValue(
      createListQuery({ data: null, error: { message: 'timeout' } }),
    )

    const { result } = renderHook(() => useHallOfFame())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch hall of fame entries')
    expect(result.current.entries).toEqual([])
  })
})
