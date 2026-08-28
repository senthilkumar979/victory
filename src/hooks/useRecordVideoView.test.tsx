import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRecordVideoView } from './useRecordVideoView'

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe('useRecordVideoView', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true }),
    )
  })

  it('does not record a view when videoId is missing', () => {
    renderHook(() => useRecordVideoView(undefined))

    expect(fetch).not.toHaveBeenCalled()
  })

  it('posts a view once per video for the session', async () => {
    const { rerender } = renderHook(
      ({ id }: { id: string | undefined }) => useRecordVideoView(id),
      { initialProps: { id: 'video-1' } },
    )

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })
    expect(fetch).toHaveBeenCalledWith('/api/session-videos/video-1/view', {
      method: 'POST',
    })
    expect(sessionStorage.getItem('video-view-video-1')).toBe('1')

    rerender({ id: 'video-1' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not persist the session key when the view request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network')),
    )

    renderHook(() => useRecordVideoView('video-2'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })
    expect(sessionStorage.getItem('video-view-video-2')).toBeNull()
  })
})
