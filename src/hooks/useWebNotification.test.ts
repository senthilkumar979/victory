import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useWebNotification } from './useWebNotification'

class MockNotification {
  static permission: NotificationPermission = 'default'
  static requestPermission = vi.fn()
  title: string
  options: NotificationOptions | undefined

  constructor(title: string, options?: NotificationOptions) {
    this.title = title
    this.options = options
  }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useWebNotification', () => {
  const play = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    MockNotification.permission = 'default'
    MockNotification.requestPermission.mockReset()
    vi.stubGlobal('Notification', MockNotification)
    function MockAudio() {
      return { play }
    }
    vi.stubGlobal('Audio', MockAudio)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('reports unsupported when Notification is missing', () => {
    vi.unstubAllGlobals()
    vi.stubGlobal('Notification', undefined)

    const { result } = renderHook(() => useWebNotification())

    expect(result.current.isSupported).toBe(false)
    expect(result.current.canNotify).toBe(false)
  })

  it('does not re-prompt after permission is already granted or denied', async () => {
    MockNotification.permission = 'denied'
    const denied = renderHook(() => useWebNotification())
    await expect(denied.result.current.requestPermission()).resolves.toBe('denied')
    expect(MockNotification.requestPermission).not.toHaveBeenCalled()

    MockNotification.permission = 'granted'
    const granted = renderHook(() => useWebNotification())
    await expect(granted.result.current.requestPermission()).resolves.toBe(
      'granted',
    )
    expect(MockNotification.requestPermission).not.toHaveBeenCalled()
  })

  it('stores a newly granted permission', async () => {
    MockNotification.requestPermission.mockResolvedValue('granted')
    const { result } = renderHook(() => useWebNotification())

    await act(async () => {
      await expect(result.current.requestPermission()).resolves.toBe('granted')
    })

    expect(result.current.permission).toBe('granted')
    expect(result.current.canNotify).toBe(true)
  })

  it('keeps the current permission when the browser request fails', async () => {
    MockNotification.requestPermission.mockRejectedValue(new Error('blocked'))
    const { result } = renderHook(() => useWebNotification())

    await expect(result.current.requestPermission()).resolves.toBe('default')
    expect(result.current.permission).toBe('default')
  })

  it('notifies only when supported, titled, and granted', () => {
    MockNotification.permission = 'granted'
    const constructed: Array<{ title: string; body?: string }> = []
    class TrackingNotification extends MockNotification {
      constructor(title: string, options?: NotificationOptions) {
        super(title, options)
        constructed.push({ title, body: options?.body })
      }
    }
    TrackingNotification.permission = 'granted'
    vi.stubGlobal('Notification', TrackingNotification)

    const { result } = renderHook(() => useWebNotification())

    result.current.notify('')
    result.current.notify('Hello', { body: 'World' })

    expect(constructed).toEqual([{ title: 'Hello', body: 'World' }])
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('does not construct a notification without grant', () => {
    const { result } = renderHook(() => useWebNotification())

    result.current.notify('Hello')

    expect(play).not.toHaveBeenCalled()
  })
})
