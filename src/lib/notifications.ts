import { supabase } from './supabase'

// VAPID keys for push notifications
// These are example keys - in production, generate your own VAPID keys
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HtLlVLOPOHmgXblxitjyS-m5uLKwz-0aPDkHtfQBocsSiS7LI'

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  actions?: NotificationAction[]
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: NotificationAction[]
  vibrate?: number[]
}

class NotificationService {
  private static instance: NotificationService
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Verificar si las notificaciones están soportadas
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  }

  // Obtener el estado actual de los permisos
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied'
    return Notification.permission
  }

  // Solicitar permisos de notificación
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Las notificaciones no están soportadas en este navegador')
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Registrar el service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker no está soportado')
      return null
    }

    try {
      // First register the custom service worker for push notifications
      this.registration = await navigator.serviceWorker.register('/custom-sw.js', {
        scope: '/'
      })
      console.log('Custom Service Worker registrado exitosamente:', this.registration)
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready
      
      return this.registration
    } catch (error) {
      console.error('Error registrando Service Worker:', error)
      return null
    }
  }

  // Obtener la suscripción push actual
  async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker()
    }

    if (!this.registration) return null

    try {
      return await this.registration.pushManager.getSubscription()
    } catch (error) {
      console.error('Error obteniendo suscripción push:', error)
      return null
    }
  }

  // Suscribirse a notificaciones push
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker()
    }

    if (!this.registration) return null

    try {
      // Verificar si ya existe una suscripción
      let subscription = await this.registration.pushManager.getSubscription()
      
      if (!subscription) {
        // Crear nueva suscripción
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY
          )
        })
      }

      // Guardar la suscripción en Supabase
      await this.savePushSubscription(subscription)
      
      return subscription
    } catch (error) {
      console.error('Error suscribiéndose a push:', error)
      return null
    }
  }

  // Desuscribirse de notificaciones push
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      const subscription = await this.getPushSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await this.removePushSubscription()
        return true
      }
      return false
    } catch (error) {
      console.error('Error desuscribiéndose de push:', error)
      return false
    }
  }

  // Mostrar notificación local
  async showNotification(payload: NotificationPayload): Promise<void> {
    const permission = await this.requestPermission()
    
    if (permission !== 'granted') {
      throw new Error('Permisos de notificación denegados')
    }

    if (!this.registration) {
      await this.registerServiceWorker()
    }

    if (this.registration) {
      const options: ExtendedNotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-96x96.png',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: payload.actions
      }
      
      await this.registration.showNotification(payload.title, options)
    } else {
      // Fallback a notificación básica
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png'
      })
    }
  }

  // Notificaciones específicas para la app
  async notifyBudgetExceeded(categoryName: string, amount: number, budgetAmount: number): Promise<void> {
    await this.showNotification({
      title: '⚠️ Presupuesto Excedido',
      body: `Has superado el presupuesto de ${categoryName} por $${(amount - budgetAmount).toLocaleString()}`,
      tag: 'budget-exceeded',
      data: { type: 'budget', category: categoryName },
      actions: [
        { action: 'view', title: 'Ver Presupuestos' },
        { action: 'dismiss', title: 'Descartar' }
      ]
    })
  }

  async notifyLowBudget(categoryName: string, remaining: number): Promise<void> {
    await this.showNotification({
      title: '💰 Presupuesto Bajo',
      body: `Te quedan $${remaining.toLocaleString()} en ${categoryName}`,
      tag: 'budget-low',
      data: { type: 'budget', category: categoryName },
      actions: [
        { action: 'view', title: 'Ver Detalles' },
        { action: 'dismiss', title: 'OK' }
      ]
    })
  }

  async notifyMonthlyReport(totalIncome: number, totalExpenses: number): Promise<void> {
    const balance = totalIncome - totalExpenses
    const isPositive = balance >= 0
    
    await this.showNotification({
      title: '📊 Reporte Mensual',
      body: `Balance: ${isPositive ? '+' : ''}$${balance.toLocaleString()}. Ingresos: $${totalIncome.toLocaleString()}, Gastos: $${totalExpenses.toLocaleString()}`,
      tag: 'monthly-report',
      data: { type: 'report', balance, totalIncome, totalExpenses },
      actions: [
        { action: 'view-stats', title: 'Ver Estadísticas' },
        { action: 'dismiss', title: 'OK' }
      ]
    })
  }

  // Guardar suscripción en Supabase
  private async savePushSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get keys using the getKey method
      const p256dhKey = subscription.getKey('p256dh')
      const authKey = subscription.getKey('auth')
      
      // Convert ArrayBuffer to base64 string
      const p256dh = p256dhKey ? btoa(String.fromCharCode(...new Uint8Array(p256dhKey))) : null
      const auth = authKey ? btoa(String.fromCharCode(...new Uint8Array(authKey))) : null

      await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
    } catch (error) {
      console.error('Error guardando suscripción push:', error)
    }
  }

  // Remover suscripción de Supabase
  private async removePushSubscription(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
    } catch (error) {
      console.error('Error removiendo suscripción push:', error)
    }
  }

  // Convertir VAPID key a Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Exportar instancia singleton
export const notificationService = NotificationService.getInstance()

// Tipos para exportar
export type { NotificationPayload, NotificationAction }