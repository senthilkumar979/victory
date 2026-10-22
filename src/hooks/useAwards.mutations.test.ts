import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAwards } from './useAwards'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: fromMock },
}))

function createListQuery(result: { data: unknown; error: unknown }) {
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

function createMutationQuery(result: { error: unknown }) {
  const query = {
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn().mockResolvedValue(result),
  }
  query.update.mockReturnValue(query)
  query.delete.mockReturnValue(query)
  return query
}

const award = {
  awardedTo: 'ada@example.com',
  awardedOn: '2026-03-01',
  description: 'Outstanding',
  awardCategoryId: '',
}

afterEach(() => {
  cleanup()
})

describe('useAwards mutations', () => {
  const listQuery = createListQuery({ data: [], error: null })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    fromMock.mockImplementation((table: string) => {
      if (table !== 'awards') throw new Error(`unexpected table ${table}`)
      return listQuery
    })
  })

  it('stores an empty category as null, then refetches after update', async () => {
    const updateQuery = createMutationQuery({ error: null })
    let calls = 0
    fromMock.mockImplementation((table: string) => {
      if (table !== 'awards') throw new Error(`unexpected table ${table}`)
      calls += 1
      return calls === 2 ? updateQuery : listQuery
    })

    const { result } = renderHook(() => useAwards())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateAward('aw1', award)
    })

    expect(updateQuery.update).toHaveBeenCalledWith({
      awarded_to: 'ada@example.com',
      awarded_on: '2026-03-01',
      description: 'Outstanding',
      award_category_id: null,
    })
    expect(updateQuery.eq).toHaveBeenCalledWith('id', 'aw1')
    expect(listQuery.select).toHaveBeenCalledTimes(2)
  })

  it('throws the database error and does not refetch when update fails', async () => {
    const updateError = { message: 'denied', code: '42501' }
    const updateQuery = createMutationQuery({ error: updateError })
    let calls = 0
    fromMock.mockImplementation((table: string) => {
      if (table !== 'awards') throw new Error(`unexpected table ${table}`)
      calls += 1
      return calls === 2 ? updateQuery : listQuery
    })

    const { result } = renderHook(() => useAwards())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      act(async () => {
        await result.current.updateAward('aw1', award)
      }),
    ).rejects.toEqual(updateError)
    expect(listQuery.select).toHaveBeenCalledTimes(1)
  })

  it('deletes by id and throws without refetching when delete fails', async () => {
    const deleteError = { message: 'in use' }
    const deleteQuery = createMutationQuery({ error: deleteError })
    let calls = 0
    fromMock.mockImplementation((table: string) => {
      if (table !== 'awards') throw new Error(`unexpected table ${table}`)
      calls += 1
      return calls === 2 ? deleteQuery : listQuery
    })

    const { result } = renderHook(() => useAwards())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      act(async () => {
        await result.current.deleteAward('aw1')
      }),
    ).rejects.toEqual(deleteError)
    expect(deleteQuery.delete).toHaveBeenCalled()
    expect(deleteQuery.eq).toHaveBeenCalledWith('id', 'aw1')
    expect(listQuery.select).toHaveBeenCalledTimes(1)
  })
})
