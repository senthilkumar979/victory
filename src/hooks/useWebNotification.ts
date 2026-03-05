import { useCallback, useEffect, useState } from 'react'

interface WebNotificationOptions {
  body?: string
}

interface UseWebNotificationReturn {
  isSupported: boolean
  permission: NotificationPermission | 'default'
  canNotify: boolean
  requestPermission: () => Promise<NotificationPermission | 'default'>
  notify: (title: string, options?: WebNotificationOptions) => void
}

const NOTIFICATION_SOUND_URL =
  'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'

export const useWebNotification = (): UseWebNotificationReturn => {
  const isSupported =
    typeof window !== 'undefined' && 'Notification' in window && !!window.Notification

  const [permission, setPermission] = useState<NotificationPermission | 'default'>(
    isSupported ? Notification.permission : 'default',
  )

  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'default'

    if (permission === 'granted' || permission === 'denied') return permission

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Failed to request notification permission', error)
      return permission
    }
  }, [isSupported, permission])

  const playSound = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL)
      // Fire and forget – we don't need to await this
      void audio.play()
    } catch (error) {
      console.error('Failed to play notification sound', error)
    }
  }, [])

  const notify = useCallback(
    (title: string, options?: WebNotificationOptions) => {
      if (!isSupported || !title) return

      if (permission !== 'granted') return

      try {
        // Some browsers may throw if notifications are blocked at OS level
        // eslint-disable-next-line no-new
        new Notification(title, {
          body: options?.body,
        })
        playSound()
      } catch (error) {
        console.error('Failed to show web notification', error)
      }
    },
    [isSupported, permission, playSound],
  )

  useEffect(() => {
    if (!isSupported) return
    setPermission(Notification.permission)
  }, [isSupported])

  const canNotify = isSupported && permission === 'granted'

  return {
    isSupported,
    permission,
    canNotify,
    requestPermission,
    notify,
  }
}

