import { useCallback, useState } from 'react'

interface UsePushSubscriptionReturn {
  isSupported: boolean
  isRegistered: boolean
  isSubscribing: boolean
  error: string | null
  ensureSubscription: () => Promise<void>
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string | undefined
const SUBSCRIBE_ENDPOINT = process.env
  .NEXT_PUBLIC_PUSH_SUBSCRIBE_ENDPOINT as string | undefined

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray.buffer
}

export const usePushSubscription = (): UsePushSubscriptionReturn => {
  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window

  const [isRegistered, setIsRegistered] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ensureSubscription = useCallback(async () => {
    if (!isSupported) return
    if (!VAPID_PUBLIC_KEY) {
      console.warn('VITE_VAPID_PUBLIC_KEY is not set; skipping push subscription.')
      return
    }

    setIsSubscribing(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')

      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setError('Notification permission was not granted.')
          setIsSubscribing(false)
          return
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY),
        })
      }

      if (SUBSCRIBE_ENDPOINT) {
        await fetch(SUBSCRIBE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscription }),
        })
      }

      setIsRegistered(true)
    } catch (err) {
      console.error('Failed to ensure push subscription', err)
      setError(
        err instanceof Error ? err.message : 'Failed to ensure push subscription',
      )
    } finally {
      setIsSubscribing(false)
    }
  }, [isSupported])

  return {
    isSupported,
    isRegistered,
    isSubscribing,
    error,
    ensureSubscription,
  }
}

