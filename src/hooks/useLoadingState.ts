/**
 * Hook personalizado para manejar estados de carga de manera consistente
 */

import { useState, useCallback } from 'react'
import { useStandardToast } from '@/lib/toast-utils'

/**
 * Hook para manejar estados de carga simples
 */
export const useLoadingState = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => setIsLoading(true), [])
  const stopLoading = useCallback(() => setIsLoading(false), [])
  const toggleLoading = useCallback(() => setIsLoading(prev => !prev), [])

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  }
}

/**
 * Hook para manejar operaciones asíncronas con estados de carga y manejo de errores
 */
export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { showError } = useStandardToast()

  /**
   * Ejecuta una operación asíncrona con manejo automático de loading y errores
   * @param operation - Función asíncrona a ejecutar
   * @param onSuccess - Callback opcional para ejecutar en caso de éxito
   * @param onError - Callback opcional para manejar errores personalizados
   * @param errorMessage - Mensaje de error personalizado
   */
  const executeAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void,
    errorMessage?: string
  ): Promise<T | null> => {
    setIsLoading(true)
    try {
      const result = await operation()
      onSuccess?.(result)
      return result
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Error desconocido')
      
      if (onError) {
        onError(errorObj)
      } else {
        showError(errorMessage || errorObj.message)
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  return {
    isLoading,
    executeAsync
  }
}

/**
 * Hook para manejar múltiples estados de carga (útil para formularios con múltiples acciones)
 */
export const useMultipleLoadingStates = <T extends string>(keys: T[]) => {
  const [loadingStates, setLoadingStates] = useState<Record<T, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<T, boolean>)
  )

  const setLoading = useCallback((key: T, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }))
  }, [])

  const startLoading = useCallback((key: T) => setLoading(key, true), [setLoading])
  const stopLoading = useCallback((key: T) => setLoading(key, false), [setLoading])
  
  const isAnyLoading = Object.values(loadingStates).some(Boolean)
  const isLoading = useCallback((key: T) => loadingStates[key], [loadingStates])

  return {
    loadingStates,
    isLoading,
    startLoading,
    stopLoading,
    setLoading,
    isAnyLoading
  }
}

/**
 * Hook para operaciones CRUD con estados de carga específicos
 */
export const useCrudLoadingStates = () => {
  return useMultipleLoadingStates(['create', 'update', 'delete', 'submit'] as const)
}

/**
 * Hook para manejar operaciones con retry automático
 */
export const useRetryableOperation = (maxRetries: number = 3) => {
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { showError, showInfo } = useStandardToast()

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    customErrorMessage?: string
  ): Promise<T | null> => {
    setIsLoading(true)
    setRetryCount(0)

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        onSuccess?.(result)
        setRetryCount(0)
        return result
      } catch (error) {
        setRetryCount(attempt + 1)
        
        if (attempt === maxRetries) {
          const errorMessage = customErrorMessage || 
            (error instanceof Error ? error.message : 'Error desconocido')
          showError(`${errorMessage} (después de ${maxRetries + 1} intentos)`)
          return null
        } else {
          showInfo(`Reintentando operación... (${attempt + 1}/${maxRetries})`)
          // Esperar un poco antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      }
    }
    
    return null
  }, [maxRetries, showError, showInfo])

  return {
    isLoading: isLoading,
    retryCount,
    executeWithRetry,
    setIsLoading
  }
}