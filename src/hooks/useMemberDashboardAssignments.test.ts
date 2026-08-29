import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMemberDashboardAssignments } from './useMemberDashboardAssignments'

const assignment = {
  id: 'asg-1',
  title: 'Week 1',
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response
}

describe('useMemberDashboardAssignments', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not fetch per-assignment submissions for admins', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ assignments: [assignment], isAdmin: true }),
    )

    const { result } = renderHook(() => useMemberDashboardAssignments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('/api/assignments')
    expect(result.current.assignments).toEqual([assignment])
    expect(result.current.submissions).toEqual({})
    expect(result.current.error).toBeNull()
  })

  it('loads mySubmission for each assignment for students', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({
          assignments: [assignment, { id: 'asg-2', title: 'Week 2' }],
          isAdmin: false,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ mySubmission: { id: 'sub-1', status: 'submitted' } }),
      )
      .mockResolvedValueOnce(jsonResponse({}))

    const { result } = renderHook(() => useMemberDashboardAssignments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetch).toHaveBeenCalledWith('/api/assignments/asg-1')
    expect(fetch).toHaveBeenCalledWith('/api/assignments/asg-2')
    expect(result.current.submissions).toEqual({
      'asg-1': { id: 'sub-1', status: 'submitted' },
      'asg-2': null,
    })
  })

  it('surfaces the API error message when the list request fails', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ error: 'Student profile required.' }, false, 403),
    )

    const { result } = renderHook(() => useMemberDashboardAssignments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Student profile required.')
    expect(result.current.assignments).toEqual([])
  })
})
