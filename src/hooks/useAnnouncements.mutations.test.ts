import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAnnouncements } from './useAnnouncements'

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

const payload = {
  title: 'Office hours',
  description: 'Friday 5pm',
}

afterEach(() => {
  cleanup()
})

describe('useAnnouncements mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('updates an announcement and refetches the list', async () => {
    const listQuery = createListQuery({ data: [], error: null })
    const updateQuery = createMutationQuery({ error: null })
    let updates = 0
    fromMock.mockImplementation(() => {
      updates += 1
      return updates === 2 ? updateQuery : listQuery
    })

    const { result } = renderHook(() => useAnnouncements())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateAnnouncement('a1', payload)
    })

    expect(updateQuery.update).toHaveBeenCalledWith(payload)
    expect(updateQuery.eq).toHaveBeenCalledWith('id', 'a1')
    expect(result.current.error).toBeNull()
    expect(listQuery.select).toHaveBeenCalledTimes(2)
  })

  it('maps a failed update to the update fallback and skips the refetch', async () => {
    const listQuery = createListQuery({ data: [], error: null })
    const updateQuery = createMutationQuery({ error: { message: 'denied' } })
    let updates = 0
    fromMock.mockImplementation(() => {
      updates += 1
      return updates === 2 ? updateQuery : listQuery
    })

    const { result } = renderHook(() => useAnnouncements())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateAnnouncement('a1', payload)
    })

    expect(result.current.error).toBe('Failed to update announcement')
    expect(listQuery.select).toHaveBeenCalledTimes(1)
  })

  it('deletes an announcement and refetches the list', async () => {
    const listQuery = createListQuery({ data: [], error: null })
    const deleteQuery = createMutationQuery({ error: null })
    let calls = 0
    fromMock.mockImplementation(() => {
      calls += 1
      return calls === 2 ? deleteQuery : listQuery
    })

    const { result } = renderHook(() => useAnnouncements())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.deleteAnnouncement('a1')
    })

    expect(deleteQuery.delete).toHaveBeenCalled()
    expect(deleteQuery.eq).toHaveBeenCalledWith('id', 'a1')
    expect(result.current.error).toBeNull()
    expect(listQuery.select).toHaveBeenCalledTimes(2)
  })

  it('maps a failed delete and a non-Error list failure to their fallbacks', async () => {
    const listQuery = createListQuery({ data: null, error: { code: 'XX000' } })
    fromMock.mockImplementation(() => listQuery)

    const { result } = renderHook(() => useAnnouncements())
    await waitFor(() =>
      expect(result.current.error).toBe('Failed to fetch announcements'),
    )

    const deleteQuery = createMutationQuery({ error: { message: 'denied' } })
    fromMock.mockImplementation(() => deleteQuery)

    await act(async () => {
      await result.current.deleteAnnouncement('a1')
    })

    expect(result.current.error).toBe('Failed to delete announcement')
  })
})
