/* eslint-disable no-restricted-globals */

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch (error) {
    // Fallback for non-JSON payloads
    data = { title: String(event.data.text() || 'New notification') }
  }

  const title = data.title || 'New notification'

  /** @type {NotificationOptions} */
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge-72.png',
    data: {
      url: data.url || '/',
    },
    renotify: true,
    tag: data.tag || 'announcement',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data && event.notification.data.url

  if (!targetUrl) return

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const existingClient = clientList.find((client) =>
          client.url.includes(targetUrl),
        )

        if (existingClient && 'focus' in existingClient) {
          return existingClient.focus()
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }

        return null
      }),
  )
})

