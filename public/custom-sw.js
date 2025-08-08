// Custom Service Worker for Push Notifications
// This file handles push notifications for Galeon Money

// Push notification event listener
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)
  
  let notificationData = {
    title: 'Galeon Money',
    body: 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'galeon-notification',
    requireInteraction: false,
    data: {},
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ]
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        ...notificationData,
        ...data,
        data: data // Store original data for click handling
      }
    } catch (e) {
      console.error('Error parsing push data:', e)
      notificationData.body = event.data.text() || notificationData.body
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Notification click event listener
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  // Default action or 'view' action
  let urlToOpen = '/dashboard'
  
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url
  } else if (event.notification.data && event.notification.data.type) {
    // Route based on notification type
    switch (event.notification.data.type) {
      case 'budget_exceeded':
      case 'budget_low':
        urlToOpen = '/dashboard/presupuestos'
        break
      case 'monthly_report':
        urlToOpen = '/dashboard/estadisticas'
        break
      case 'new_movement':
        urlToOpen = '/dashboard/movimientos'
        break
      default:
        urlToOpen = '/dashboard'
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            // If dashboard is open, navigate to specific page
            client.postMessage({
              type: 'NAVIGATE',
              url: urlToOpen
            })
            return client.focus()
          }
        }
        
        // If no existing window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Message event listener for communication with the main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      Promise.resolve()
    )
  }
})

// Install event
self.addEventListener('install', (event) => {
  console.log('Custom Service Worker installing')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Custom Service Worker activating')
  event.waitUntil(clients.claim())
})