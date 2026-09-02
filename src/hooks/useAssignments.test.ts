import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAssignments } from './useAssignments'

const fetchMock = vi.fn()

function mockJsonResponse(body: unknown, ok = true) {
  fetchMock.mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(body),
  })
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useAssignments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    mockJsonResponse({ assignments: [], isAdmin: false })
  })

  it('treats a missing assignments payload as an empty list', async () => {
    mockJsonResponse({ isAdmin: true })

    const { result } = renderHook(() => useAssignments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetchMock).toHaveBeenCalledWith('/api/assignments')
    expect(result.current.assignments).toEqual([])
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('uses Boolean() for isAdmin so 0 is false and the string "false" is true', async () => {
    mockJsonResponse({ assignments: [{ id: 'a1' }], isAdmin: 0 })
    const zeroAdmin = renderHook(() => useAssignments())
    await waitFor(() => expect(zeroAdmin.result.current.isLoading).toBe(false))
    expect(zeroAdmin.result.current.isAdmin).toBe(false)

    mockJsonResponse({ assignments: [{ id: 'a1' }], isAdmin: 'false' })
    const stringFalse = renderHook(() => useAssignments())
    await waitFor(() => expect(stringFalse.result.current.isLoading).toBe(false))
    expect(stringFalse.result.current.isAdmin).toBe(true)
  })

  it('uses the API error string and falls back when the body has no error', async () => {
    mockJsonResponse({ error: 'Not signed in' }, false)
    const withMessage = renderHook(() => useAssignments())
    await waitFor(() => expect(withMessage.result.current.isLoading).toBe(false))
    expect(withMessage.result.current.error).toBe('Not signed in')

    mockJsonResponse({}, false)
    const fallback = renderHook(() => useAssignments())
    await waitFor(() => expect(fallback.result.current.isLoading).toBe(false))
    expect(fallback.result.current.error).toBe('Failed to load assignments')
  })
})
