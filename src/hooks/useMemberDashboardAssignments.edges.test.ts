import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMemberDashboardAssignments } from './useMemberDashboardAssignments'

const assignment = { id: 'asg-1', title: 'Week 1' }

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response
}

describe('useMemberDashboardAssignments fallbacks', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('uses a generic message when a failed list response has no error field', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, false, 500))

    const { result } = renderHook(() => useMemberDashboardAssignments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to load assignments')
    expect(result.current.assignments).toEqual([])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('uses a generic message when the list request rejects with a non-Error', async () => {
    vi.mocked(fetch).mockRejectedValue('socket hang up')

    const { result } = renderHook(() => useMemberDashboardAssignments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to load assignments')
    expect(result.current.assignments).toEqual([])
  })

  it('does not fetch assignment details when the list payload has no assignments', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ assignments: null, isAdmin: false }),
    )

    const { result } = renderHook(() => useMemberDashboardAssignments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('/api/assignments')
    expect(result.current.assignments).toEqual([])
    expect(result.current.submissions).toEqual({})
    expect(result.current.error).toBeNull()
  })

  it('keeps the loaded list when a later submission request fails', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ assignments: [assignment] }))
      .mockRejectedValueOnce(new Error('network down'))

    const { result } = renderHook(() => useMemberDashboardAssignments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.assignments).toEqual([assignment])
    expect(result.current.submissions).toEqual({})
    expect(result.current.error).toBe('network down')
  })
})
