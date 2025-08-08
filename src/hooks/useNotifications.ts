import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '@/lib/notifications'
import { useAuth } from '@/providers/auth-provider'
import { useSettings } from './useSettings'

interface UseNotificationsReturn {
  // Estados
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  isLoading: boolean
  
  // Acciones
  requestPermission: () => Promise<boolean>
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  
  // Notificaciones específicas
  notifyBudgetExceeded: (categoryName: string, amount: number, budgetAmount: number) => Promise<void>
  notifyLowBudget: (categoryName: string, remaining: number) => Promise<void>
  notifyMonthlyReport: (totalIncome: number, totalExpenses: number) => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth()
  const { preferences } = useSettings()
  
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Verificar soporte y estado inicial
  useEffect(() => {
    const checkSupport = () => {
      const supported = notificationService.isSupported()
      setIsSupported(supported)
      
      if (supported) {
        setPermission(notificationService.getPermissionStatus())
      }
    }

    checkSupport()
  }, [])

  // Verificar suscripción existente
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported || !user) return
      
      try {
        const subscription = await notificationService.getPushSubscription()
        setIsSubscribed(!!subscription)
      } catch (error) {
        console.error('Error verificando suscripción:', error)
        setIsSubscribed(false)
      }
    }

    checkSubscription()
  }, [isSupported, user])

  // Solicitar permisos
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false
    
    setIsLoading(true)
    try {
      const newPermission = await notificationService.requestPermission()
      setPermission(newPermission)
      return newPermission === 'granted'
    } catch (error) {
      console.error('Error solicitando permisos:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  // Suscribirse a notificaciones push
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) return false
    
    setIsLoading(true)
    try {
      // Primero solicitar permisos si no los tenemos
      if (permission !== 'granted') {
        const granted = await requestPermission()
        if (!granted) return false
      }

      const subscription = await notificationService.subscribeToPush()
      const success = !!subscription
      setIsSubscribed(success)
      return success
    } catch (error) {
      console.error('Error suscribiéndose:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, user, permission, requestPermission])

  // Desuscribirse de notificaciones push
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false
    
    setIsLoading(true)
    try {
      const success = await notificationService.unsubscribeFromPush()
      if (success) {
        setIsSubscribed(false)
      }
      return success
    } catch (error) {
      console.error('Error desuscribiéndose:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  // Notificación de presupuesto excedido
  const notifyBudgetExceeded = useCallback(async (
    categoryName: string, 
    amount: number, 
    budgetAmount: number
  ): Promise<void> => {
    // Solo notificar si las notificaciones están habilitadas
    if (!preferences?.notifications || permission !== 'granted') return
    
    try {
      await notificationService.notifyBudgetExceeded(categoryName, amount, budgetAmount)
    } catch (error) {
      console.error('Error enviando notificación de presupuesto excedido:', error)
    }
  }, [preferences?.notifications, permission])

  // Notificación de presupuesto bajo
  const notifyLowBudget = useCallback(async (
    categoryName: string, 
    remaining: number
  ): Promise<void> => {
    if (!preferences?.notifications || permission !== 'granted') return
    
    try {
      await notificationService.notifyLowBudget(categoryName, remaining)
    } catch (error) {
      console.error('Error enviando notificación de presupuesto bajo:', error)
    }
  }, [preferences?.notifications, permission])

  // Notificación de reporte mensual
  const notifyMonthlyReport = useCallback(async (
    totalIncome: number, 
    totalExpenses: number
  ): Promise<void> => {
    if (!preferences?.notifications || permission !== 'granted') return
    
    try {
      await notificationService.notifyMonthlyReport(totalIncome, totalExpenses)
    } catch (error) {
      console.error('Error enviando notificación de reporte mensual:', error)
    }
  }, [preferences?.notifications, permission])

  return {
    // Estados
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    
    // Acciones
    requestPermission,
    subscribe,
    unsubscribe,
    
    // Notificaciones específicas
    notifyBudgetExceeded,
    notifyLowBudget,
    notifyMonthlyReport
  }
}