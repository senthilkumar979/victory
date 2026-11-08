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

function mockRoadmapQuery(fetch: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(fetch),
    insert: vi.fn().mockResolvedValue({ error: null }),
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

describe('useRoadmapProgress load and write guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('hides database error text when loading progress fails with a non-Error', async () => {
    mockRoadmapQuery({
      data: { id: 'react', completed_nodes: ['intro'] },
      error: { message: 'permission denied' },
    })

    const { result } = renderHook(() => useRoadmapProgress('react'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Failed to load roadmap progress')
    expect(result.current.completedNodes).toEqual([])
  })
  it('treats a non-array completion list as empty', async () => {
    mockRoadmapQuery({
      data: { id: 'react', completed_nodes: 'intro' },
      error: null,
    })

    const { result } = renderHook(() => useRoadmapProgress('react'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.completedNodes).toEqual([])
    expect(result.current.error).toBeNull()
  })
  it('does not write completions when the roadmap id is empty', async () => {
    const { result } = renderHook(() => useRoadmapProgress(''))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => {
      await result.current.markComplete('intro')
      await result.current.unmarkComplete('intro')
    })

    expect(fromMock).not.toHaveBeenCalled()
    expect(result.current.completedNodes).toEqual([])
  })
  it('appends a new node onto an existing completion row', async () => {
    const query = mockRoadmapQuery({
      data: { id: 'react', completed_nodes: ['intro'] },
      error: null,
    })

    const { result } = renderHook(() => useRoadmapProgress('react'))
    await waitFor(() => expect(result.current.completedNodes).toEqual(['intro']))

    await act(async () => {
      await result.current.markComplete('hooks')
    })

    expect(query.update).toHaveBeenCalledWith({
      completed_nodes: ['intro', 'hooks'],
    })
    expect(query.insert).not.toHaveBeenCalled()
    expect(result.current.completedNodes).toEqual(['intro', 'hooks'])
    expect(result.current.error).toBeNull()
  })
  it('drops the optimistic node when the saved row cannot be read', async () => {
    const query = mockRoadmapQuery({
      data: { id: 'react', completed_nodes: [] },
      error: null,
    })
    query.maybeSingle
      .mockResolvedValueOnce({
        data: { id: 'react', completed_nodes: [] },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'read failed' },
      })

    const { result } = renderHook(() => useRoadmapProgress('react'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.markComplete('hooks')
    })

    expect(query.update).not.toHaveBeenCalled()
    expect(query.insert).not.toHaveBeenCalled()
    expect(result.current.completedNodes).toEqual([])
    expect(result.current.error).toBe('read failed')
  })
  it('does not create a row when unmarking progress that was never saved', async () => {
    const query = mockRoadmapQuery({
      data: { id: 'react', completed_nodes: ['intro'] },
      error: null,
    })
    query.maybeSingle
      .mockResolvedValueOnce({
        data: { id: 'react', completed_nodes: ['intro'] },
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: null })

    const { result } = renderHook(() => useRoadmapProgress('react'))
    await waitFor(() => expect(result.current.completedNodes).toEqual(['intro']))

    await act(async () => {
      await result.current.unmarkComplete('intro')
    })

    expect(query.update).not.toHaveBeenCalled()
    expect(query.insert).not.toHaveBeenCalled()
    expect(result.current.completedNodes).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
