import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getSubscriptionMock, subscribeMock, registerMock } = vi.hoisted(() => ({
  getSubscriptionMock: vi.fn(),
  subscribeMock: vi.fn(),
  registerMock: vi.fn(),
}))

function decodeApplicationServerKey(key: ArrayBuffer): string {
  const bytes = new Uint8Array(key)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return binary
}

async function loadHook() {
  const { usePushSubscription } = await import('./usePushSubscription')
  return usePushSubscription
}

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('usePushSubscription', () => {
  beforeEach(() => {
    vi.resetModules()
    getSubscriptionMock.mockReset()
    subscribeMock.mockReset()
    registerMock.mockReset()
    registerMock.mockResolvedValue({
      pushManager: {
        getSubscription: getSubscriptionMock,
        subscribe: subscribeMock,
      },
    })

    Object.defineProperty(window.navigator, 'serviceWorker', {
      configurable: true,
      value: { register: registerMock },
    })
    Object.defineProperty(window, 'PushManager', {
      configurable: true,
      value: function PushManager() {},
    })
    vi.stubGlobal(
      'Notification',
      { requestPermission: vi.fn() } as unknown as typeof Notification,
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  it('skips registration when the VAPID public key is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', '')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const usePushSubscription = await loadHook()
    const { result } = renderHook(() => usePushSubscription())

    await act(async () => {
      await result.current.ensureSubscription()
    })

    expect(registerMock).not.toHaveBeenCalled()
    expect(result.current.isRegistered).toBe(false)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('reuses an existing subscription and posts it when an endpoint is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'dGVzdA')
    vi.stubEnv('NEXT_PUBLIC_PUSH_SUBSCRIBE_ENDPOINT', '/api/push')
    const existing = { endpoint: 'https://push.example/1' }
    getSubscriptionMock.mockResolvedValue(existing)

    const usePushSubscription = await loadHook()
    const { result } = renderHook(() => usePushSubscription())

    await act(async () => {
      await result.current.ensureSubscription()
    })

    expect(Notification.requestPermission).not.toHaveBeenCalled()
    expect(subscribeMock).not.toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledWith('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: existing }),
    })
    expect(result.current.isRegistered).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.isSubscribing).toBe(false)
  })

  it('stops when notification permission is denied', async () => {
    vi.stubEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'dGVzdA')
    getSubscriptionMock.mockResolvedValue(null)
    vi.mocked(Notification.requestPermission).mockResolvedValue('denied')

    const usePushSubscription = await loadHook()
    const { result } = renderHook(() => usePushSubscription())

    await act(async () => {
      await result.current.ensureSubscription()
    })

    expect(subscribeMock).not.toHaveBeenCalled()
    expect(result.current.isRegistered).toBe(false)
    expect(result.current.error).toBe('Notification permission was not granted.')
    expect(result.current.isSubscribing).toBe(false)
  })

  it('decodes a URL-safe VAPID key before subscribing', async () => {
    vi.stubEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'ab-c_d')
    getSubscriptionMock.mockResolvedValue(null)
    vi.mocked(Notification.requestPermission).mockResolvedValue('granted')
    subscribeMock.mockResolvedValue({ endpoint: 'https://push.example/new' })

    const usePushSubscription = await loadHook()
    const { result } = renderHook(() => usePushSubscription())

    await act(async () => {
      await result.current.ensureSubscription()
    })

    expect(subscribeMock).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    )
    const key = subscribeMock.mock.calls[0]?.[0]?.applicationServerKey as ArrayBuffer
    expect(decodeApplicationServerKey(key)).toBe(window.atob('ab+c/d=='))
    expect(result.current.isRegistered).toBe(true)
  })

  it('registers locally without posting when no subscribe endpoint is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'dGVzdA')
    vi.stubEnv('NEXT_PUBLIC_PUSH_SUBSCRIBE_ENDPOINT', '')
    getSubscriptionMock.mockResolvedValue({ endpoint: 'https://push.example/1' })

    const usePushSubscription = await loadHook()
    const { result } = renderHook(() => usePushSubscription())

    await act(async () => {
      await result.current.ensureSubscription()
    })

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.isRegistered).toBe(true)
  })

  it('stores a non-Error failure as the generic message', async () => {
    vi.stubEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'dGVzdA')
    getSubscriptionMock.mockRejectedValue({ message: 'quota' })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const usePushSubscription = await loadHook()
    const { result } = renderHook(() => usePushSubscription())

    await act(async () => {
      await result.current.ensureSubscription()
    })

    expect(result.current.error).toBe('Failed to ensure push subscription')
    expect(result.current.isRegistered).toBe(false)
    expect(result.current.isSubscribing).toBe(false)
    consoleError.mockRestore()
  })
})
