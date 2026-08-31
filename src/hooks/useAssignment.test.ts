import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAssignment } from './useAssignment'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useAssignment', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('does not fetch when the assignment id is empty', async () => {
    const { result } = renderHook(() => useAssignment(''))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.assignment).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('maps assignment payload and permission flags', async () => {
    const assignment = { id: 'a1', title: 'Lab 1' }
    const mySubmission = { id: 'sub-1' }
    const submissions = [{ id: 'sub-1' }, { id: 'sub-2' }]

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        assignment,
        mySubmission,
        submissions,
        isAdmin: true,
        canSubmit: 0,
      }),
    } as Response)

    const { result } = renderHook(() => useAssignment('a1'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetch).toHaveBeenCalledWith('/api/assignments/a1')
    expect(result.current.assignment).toEqual(assignment)
    expect(result.current.mySubmission).toEqual(mySubmission)
    expect(result.current.submissions).toEqual(submissions)
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.canSubmit).toBe(false)
  })

  it('defaults missing payload fields and treats non-boolean admin as false', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useAssignment('a1'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.assignment).toBeNull()
    expect(result.current.mySubmission).toBeNull()
    expect(result.current.submissions).toBeNull()
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canSubmit).toBe(false)
  })

  it('uses the API error message when the request fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Forbidden' }),
    } as Response)

    const { result } = renderHook(() => useAssignment('a1'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Forbidden')
    expect(result.current.assignment).toBeNull()
  })

  it('uses the generic fallback when a non-Error is thrown', async () => {
    vi.mocked(fetch).mockRejectedValue({ message: 'timeout' })

    const { result } = renderHook(() => useAssignment('a1'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to load assignment')
  })
})
