import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useGoogleGroups } from './useGoogleGroups'

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
  then: (
    onFulfilled: (value: { data: unknown; error: unknown }) => unknown,
  ) => Promise<unknown>
}

function createListQuery(result: { data: unknown; error: unknown }): ListQuery {
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

const groups = [
  { id: 'g1', name: 'Alumni', email: 'alumni@mentorbridge.in' },
]

afterEach(() => {
  cleanup()
})

describe('useGoogleGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('loads groups ordered by name', async () => {
    const query = createListQuery({ data: groups, error: null })
    fromMock.mockReturnValue(query)

    const { result } = renderHook(() => useGoogleGroups())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('google_groups')
    expect(query.select).toHaveBeenCalledWith('id, name, email')
    expect(query.order).toHaveBeenCalledWith('name', { ascending: true })
    expect(result.current.groups).toEqual(groups)
  })

  it('creates, updates, and deletes a group then refetches', async () => {
    const listQuery = createListQuery({ data: groups, error: null })
    const mutateQuery = createMutateQuery({ error: null })
    fromMock.mockImplementation(() =>
      fromMock.mock.calls.length % 2 === 1 ? listQuery : mutateQuery,
    )

    const { result } = renderHook(() => useGoogleGroups())
    await waitFor(() => expect(result.current.groups).toEqual(groups))

    await act(async () => {
      await result.current.createGroup({
        name: 'Cohort 12',
        email: 'c12@mentorbridge.in',
      })
    })
    expect(mutateQuery.insert).toHaveBeenCalledWith({
      name: 'Cohort 12',
      email: 'c12@mentorbridge.in',
    })

    await act(async () => {
      await result.current.updateGroup('g1', {
        name: 'Alumni updated',
        email: 'alumni@mentorbridge.in',
      })
    })
    expect(mutateQuery.update).toHaveBeenCalledWith({
      name: 'Alumni updated',
      email: 'alumni@mentorbridge.in',
    })
    expect(mutateQuery.eq).toHaveBeenCalledWith('id', 'g1')

    await act(async () => {
      await result.current.deleteGroup('g1')
    })
    expect(mutateQuery.delete).toHaveBeenCalled()
    expect(mutateQuery.eq).toHaveBeenCalledWith('id', 'g1')
    expect(result.current.error).toBeNull()
  })

  it('maps Postgrest-style errors to generic CRUD fallbacks and does not refetch', async () => {
    const listQuery = createListQuery({ data: groups, error: null })
    const failQuery = createMutateQuery({ error: { message: 'denied' } })
    let didFail = false
    fromMock.mockImplementation(() => {
      if (!didFail) return listQuery
      return failQuery
    })

    const { result } = renderHook(() => useGoogleGroups())
    await waitFor(() => expect(result.current.groups).toEqual(groups))

    const callsAfterLoad = fromMock.mock.calls.length
    didFail = true

    await act(async () => {
      await result.current.createGroup({
        name: 'Broken',
        email: 'broken@mentorbridge.in',
      })
    })
    expect(result.current.error).toBe('Failed to create Google group')
    expect(fromMock.mock.calls.length).toBe(callsAfterLoad + 1)

    await act(async () => {
      await result.current.updateGroup('g1', {
        name: 'Broken',
        email: 'broken@mentorbridge.in',
      })
    })
    expect(result.current.error).toBe('Failed to update Google group')

    await act(async () => {
      await result.current.deleteGroup('g1')
    })
    expect(result.current.error).toBe('Failed to delete Google group')
  })
})
