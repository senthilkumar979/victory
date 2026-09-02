import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSessionVideo } from './useSessionVideo'

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

describe('useSessionVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('does not fetch when the video id is empty', async () => {
    const { result } = renderHook(() => useSessionVideo(''))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.video).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('treats a missing video payload as null and uses Boolean() for isAdmin', async () => {
    mockJsonResponse({ isAdmin: 'false' })

    const { result } = renderHook(() => useSessionVideo('vid-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetchMock).toHaveBeenCalledWith('/api/session-videos/vid-1')
    expect(result.current.video).toBeNull()
    expect(result.current.isAdmin).toBe(true)
  })

  it('uses the API error string and falls back when the body has no error', async () => {
    mockJsonResponse({ error: 'Not found' }, false)
    const withMessage = renderHook(() => useSessionVideo('vid-1'))
    await waitFor(() => expect(withMessage.result.current.isLoading).toBe(false))
    expect(withMessage.result.current.error).toBe('Not found')

    mockJsonResponse({}, false)
    const fallback = renderHook(() => useSessionVideo('vid-1'))
    await waitFor(() => expect(fallback.result.current.isLoading).toBe(false))
    expect(fallback.result.current.error).toBe('Failed to load video')
  })
})
