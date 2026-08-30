import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoadmapProgress } from './useRoadmapProgress'

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
  eq: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

function mockRoadmapQuery(options: {
  fetch?: { data: unknown; error: unknown }
  insertError?: unknown
  updateError?: unknown
}): QueryMocks {
  const query: QueryMocks = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(
      options.fetch ?? { data: null, error: null },
    ),
    insert: vi.fn().mockResolvedValue({ error: options.insertError ?? null }),
    update: vi.fn(),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.update.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

afterEach(() => {
  cleanup()
})

describe('useRoadmapProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('skips the database when roadmapId is empty', async () => {
    const { result } = renderHook(() => useRoadmapProgress(''))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).not.toHaveBeenCalled()
    expect(result.current.completedNodes).toEqual([])
  })

  it('keeps only string node ids from a stored completion row', async () => {
    mockRoadmapQuery({
      fetch: {
        data: { id: 'react', completed_nodes: ['intro', 2, null, 'hooks'] },
        error: null,
      },
    })

    const { result } = renderHook(() => useRoadmapProgress('react'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.completedNodes).toEqual(['intro', 'hooks'])
  })

  it('inserts a new completion row and rolls back when save fails', async () => {
    const query = mockRoadmapQuery({
      fetch: { data: null, error: null },
      insertError: { message: 'insert failed' },
    })

    const { result } = renderHook(() => useRoadmapProgress('react'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.markComplete('intro')
    })

    expect(query.insert).toHaveBeenCalledWith({
      id: 'react',
      completed_nodes: ['intro'],
    })
    expect(result.current.completedNodes).toEqual([])
    expect(result.current.error).toBe('insert failed')
  })

  it('updates an existing row without duplicating a completed node', async () => {
    const query = mockRoadmapQuery({
      fetch: {
        data: { id: 'react', completed_nodes: ['intro'] },
        error: null,
      },
    })

    const { result } = renderHook(() => useRoadmapProgress('react'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.markComplete('intro')
    })

    expect(query.update).toHaveBeenCalledWith({ completed_nodes: ['intro'] })
    expect(query.insert).not.toHaveBeenCalled()
    expect(result.current.completedNodes).toEqual(['intro'])
  })

  it('reports an error when unmarking fails to persist', async () => {
    const query = mockRoadmapQuery({
      fetch: {
        data: { id: 'react', completed_nodes: ['intro'] },
        error: null,
      },
    })
    query.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: { message: 'update failed' } }),
    })

    const { result } = renderHook(() => useRoadmapProgress('react'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.unmarkComplete('intro')
    })

    expect(query.update).toHaveBeenCalledWith({ completed_nodes: [] })
    expect(result.current.error).toBe('update failed')
  })
})
