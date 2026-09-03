import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAwardCategories } from './useAwardCategories'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
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

function createMutateQuery(result: { error: unknown }) {
  const query = {
    insert: vi.fn().mockResolvedValue(result),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn().mockResolvedValue(result),
  }
  query.update.mockReturnValue(query)
  query.delete.mockReturnValue(query)
  return query
}

const categories = [{ id: 'c1', name: 'Excellence' }]

afterEach(() => {
  cleanup()
})

describe('useAwardCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('loads categories ordered by name and treats null rows as empty', async () => {
    const query = createListQuery({ data: null, error: null })
    fromMock.mockReturnValue(query)

    const { result } = renderHook(() => useAwardCategories())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('award_categories')
    expect(query.select).toHaveBeenCalledWith('id, name')
    expect(query.order).toHaveBeenCalledWith('name', { ascending: true })
    expect(result.current.categories).toEqual([])
  })

  it('creates, updates, and deletes a category then refetches', async () => {
    const listQuery = createListQuery({ data: categories, error: null })
    const mutateQuery = createMutateQuery({ error: null })
    fromMock.mockImplementation(() =>
      fromMock.mock.calls.length % 2 === 1 ? listQuery : mutateQuery,
    )

    const { result } = renderHook(() => useAwardCategories())
    await waitFor(() => expect(result.current.categories).toEqual(categories))

    await act(async () => {
      await result.current.createCategory({ name: 'Impact' })
    })
    expect(mutateQuery.insert).toHaveBeenCalledWith({ name: 'Impact' })

    await act(async () => {
      await result.current.updateCategory('c1', { name: 'Excellence+' })
    })
    expect(mutateQuery.update).toHaveBeenCalledWith({ name: 'Excellence+' })
    expect(mutateQuery.eq).toHaveBeenCalledWith('id', 'c1')

    await act(async () => {
      await result.current.deleteCategory('c1')
    })
    expect(mutateQuery.delete).toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('maps Postgrest-style CRUD errors and does not refetch', async () => {
    const listQuery = createListQuery({ data: categories, error: null })
    const failQuery = createMutateQuery({ error: { message: 'denied' } })
    let didFail = false
    fromMock.mockImplementation(() => (didFail ? failQuery : listQuery))

    const { result } = renderHook(() => useAwardCategories())
    await waitFor(() => expect(result.current.categories).toEqual(categories))

    const callsAfterLoad = fromMock.mock.calls.length
    didFail = true

    await act(async () => {
      await result.current.createCategory({ name: 'Broken' })
    })
    expect(result.current.error).toBe('Failed to create award category')
    expect(fromMock.mock.calls.length).toBe(callsAfterLoad + 1)

    await act(async () => {
      await result.current.updateCategory('c1', { name: 'Broken' })
    })
    expect(result.current.error).toBe('Failed to update award category')

    await act(async () => {
      await result.current.deleteCategory('c1')
    })
    expect(result.current.error).toBe('Failed to delete award category')
    expect(result.current.categories).toEqual(categories)
  })
})
