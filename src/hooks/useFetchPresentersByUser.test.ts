import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFetchPresentersByUser } from './useFetchPresentersByUser'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

function createQuery(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

afterEach(() => {
  cleanup()
})

describe('useFetchPresentersByUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not query Supabase when the email is empty', async () => {
    const { result } = renderHook(() =>
      useFetchPresentersByUser({ userEmail: '' }),
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).not.toHaveBeenCalled()
    expect(result.current.presenters).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('queries presenters for the signed-in email and keeps a null payload as-is', async () => {
    const query = createQuery({ data: null, error: null })

    const { result } = renderHook(() =>
      useFetchPresentersByUser({ userEmail: 'ada@example.com' }),
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('presenters')
    expect(query.select).toHaveBeenCalledWith(
      'id, presented_by, presented_date, topic',
    )
    expect(query.eq).toHaveBeenCalledWith('presented_by', 'ada@example.com')
    expect(query.order).toHaveBeenCalledWith('presented_date', {
      ascending: false,
    })
    expect(result.current.presenters).toBeNull()
  })

  it('returns matching presenter rows for the member email', async () => {
    const rows = [
      {
        id: 'p1',
        presented_by: 'ada@example.com',
        presented_date: '2026-03-01',
        topic: 'Compilers',
      },
    ]
    createQuery({ data: rows, error: null })

    const { result } = renderHook(() =>
      useFetchPresentersByUser({ userEmail: 'ada@example.com' }),
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.presenters).toEqual(rows)
    expect(result.current.error).toBeNull()
  })
})
