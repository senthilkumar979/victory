import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRecordVideoView } from './useRecordVideoView'

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe('useRecordVideoView session dedupe', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  it('does not post when the video id is blank', () => {
    renderHook(() => useRecordVideoView(''))

    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not post when this video was already recorded in the session', () => {
    sessionStorage.setItem('video-view-video-1', '1')

    renderHook(() => useRecordVideoView('video-1'))

    expect(fetch).not.toHaveBeenCalled()
  })

  it('records a different video in the same session', async () => {
    sessionStorage.setItem('video-view-video-1', '1')

    renderHook(() => useRecordVideoView('video-2'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })
    expect(fetch).toHaveBeenCalledWith('/api/session-videos/video-2/view', {
      method: 'POST',
    })
    expect(sessionStorage.getItem('video-view-video-2')).toBe('1')
  })

  it('does not post again when the hook remounts after a successful record', async () => {
    const first = renderHook(() => useRecordVideoView('video-1'))

    await waitFor(() => {
      expect(sessionStorage.getItem('video-view-video-1')).toBe('1')
    })
    first.unmount()

    renderHook(() => useRecordVideoView('video-1'))

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('retries the view post on remount when the previous request failed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))

    const first = renderHook(() => useRecordVideoView('video-9'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })
    expect(sessionStorage.getItem('video-view-video-9')).toBeNull()
    first.unmount()

    renderHook(() => useRecordVideoView('video-9'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
    })
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/session-videos/video-9/view',
      { method: 'POST' },
    )
  })
})
