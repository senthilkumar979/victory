import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCohorts } from './useCohorts'

const cohorts = [
  { id: '12', name: 'Cohort 12' },
  { id: '11', name: 'Cohort 11' },
]

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useCohorts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads cohorts and treats a missing payload as an empty list', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useCohorts())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetchMock).toHaveBeenCalledWith('/api/cohorts')
    expect(result.current.cohorts).toEqual([])
  })

  it('keeps the previous list when a later request is not ok', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cohorts }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'denied' }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useCohorts())
    await waitFor(() => expect(result.current.cohorts).toEqual(cohorts))

    await result.current.refetch()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.cohorts).toEqual(cohorts)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
