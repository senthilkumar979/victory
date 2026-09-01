import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAnnouncements } from './useAnnouncements'

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

function createInsertQuery(result: { error: unknown }) {
  return {
    insert: vi.fn().mockResolvedValue(result),
  }
}

const announcements = [
  {
    id: 'a1',
    title: 'Welcome',
    description: 'New cohort starts Monday',
    created_at: '2026-03-01',
  },
]

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('useAnnouncements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('loads announcements newest-first and does not broadcast without an endpoint', async () => {
    const listQuery = createListQuery({ data: announcements, error: null })
    const insertQuery = createInsertQuery({ error: null })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('NEXT_PUBLIC_PUSH_BROADCAST_ENDPOINT', '')

    fromMock.mockImplementation(() =>
      fromMock.mock.calls.length % 2 === 1 ? listQuery : insertQuery,
    )

    const { result } = renderHook(() => useAnnouncements())
    await waitFor(() => expect(result.current.announcements).toEqual(announcements))

    expect(listQuery.select).toHaveBeenCalledWith(
      'id, title, description, created_at',
    )
    expect(listQuery.order).toHaveBeenCalledWith('id', { ascending: false })

    await act(async () => {
      await result.current.createAnnouncement({
        title: 'Welcome',
        description: 'New cohort starts Monday',
      })
    })

    expect(insertQuery.insert).toHaveBeenCalledWith({
      title: 'Welcome',
      description: 'New cohort starts Monday',
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('broadcasts a push notification after a successful create', async () => {
    const listQuery = createListQuery({ data: announcements, error: null })
    const insertQuery = createInsertQuery({ error: null })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv(
      'NEXT_PUBLIC_PUSH_BROADCAST_ENDPOINT',
      'https://push.example.com/broadcast',
    )

    fromMock.mockImplementation(() =>
      fromMock.mock.calls.length % 2 === 1 ? listQuery : insertQuery,
    )

    const { result } = renderHook(() => useAnnouncements())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createAnnouncement({
        title: 'Office hours',
        description: 'Friday 5pm',
      })
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://push.example.com/broadcast',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Office hours',
          body: 'A new announcement has been published.',
          url: '/announcements',
        }),
      },
    )
    expect(result.current.error).toBeNull()
  })

  it('does not broadcast when insert fails and maps Postgrest errors to a fallback', async () => {
    const listQuery = createListQuery({ data: announcements, error: null })
    const insertQuery = createInsertQuery({ error: { message: 'denied' } })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv(
      'NEXT_PUBLIC_PUSH_BROADCAST_ENDPOINT',
      'https://push.example.com/broadcast',
    )

    let shouldFail = false
    fromMock.mockImplementation(() => {
      if (!shouldFail) return listQuery
      return insertQuery
    })

    const { result } = renderHook(() => useAnnouncements())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    shouldFail = true
    await act(async () => {
      await result.current.createAnnouncement({
        title: 'Broken',
        description: 'Should not notify',
      })
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Failed to create announcement')
  })
})
