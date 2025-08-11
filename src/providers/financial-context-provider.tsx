"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { FinancialContextService } from '@/lib/services/financial-contexts'
import type { FinancialContext } from '@/lib/types'

import type { FinancialContextState } from '@/lib/types'

const FinancialContextContext = createContext<FinancialContextState | undefined>(undefined)

/**
 * Validates if a context object has the required properties
 * @param context - The context object to validate
 * @returns True if the context is valid, false otherwise
 */
const isValidContext = (context: unknown): context is FinancialContext => {
  if (!context || typeof context !== 'object' || context === null) {
    return false
  }
  
  const ctx = context as Record<string, unknown>
  
  return (
    typeof ctx.id === 'string' &&
    typeof ctx.name === 'string' &&
    ctx.id.length > 0 &&
    ctx.name.length > 0 &&
    ctx.name !== 'argilaez' // Explicitly exclude this phantom context
  )
}

/**
 * Retrieves the active financial context from localStorage
 * Provides client-side persistence for the selected financial context
 * @returns The stored financial context or null if not found/invalid
 */
const getContextFromStorage = (): FinancialContext | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('activeFinancialContext')
    if (!stored) return null
    
    const context = JSON.parse(stored)
    
    // Validate the context before returning it
    if (!isValidContext(context)) {
      console.warn('Invalid context found in localStorage, removing:', context)
      localStorage.removeItem('activeFinancialContext')
      return null
    }
    
    return context
  } catch (error) {
    console.warn('Error parsing context from localStorage:', error)
    localStorage.removeItem('activeFinancialContext')
    return null
  }
}

/**
 * Saves the active financial context to localStorage
 * Handles both storing and removing context data with error handling
 * @param context - The financial context to store, or null to remove
 */
const saveContextToStorage = (context: FinancialContext | null) => {
  if (typeof window === 'undefined') return
  try {
    if (context) {
      localStorage.setItem('activeFinancialContext', JSON.stringify(context))
    } else {
      localStorage.removeItem('activeFinancialContext')
    }
  } catch (error) {
    console.warn('Error saving context to localStorage:', error)
  }
}

/**
 * Financial Context Provider Component
 * 
 * Manages the active financial context state across the application using React Query
 * for server state management and localStorage for client-side persistence.
 * 
 * Key features:
 * - Automatic context loading with localStorage fallback
 * - Optimistic updates with error handling
 * - Cache invalidation for related data when context changes
 * - Synchronization between multiple hooks using the same context
 * 
 * @param children - React components that need access to financial context
 */
export function FinancialContextProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState<Error | null>(null)

  // Usar React Query para manejar el contexto activo
  const {
    data: activeContext,
    isLoading,
    error: queryError
  } = useQuery({
    queryKey: ['active-financial-context', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      // Intentar obtener desde localStorage primero
      const cachedContext = getContextFromStorage()
      if (cachedContext) {
        return cachedContext
      }
      
      // Si no hay cache válido, obtener desde API
      const context = await FinancialContextService.getCurrentContext(user.id)
      
      // Guardar en localStorage
      saveContextToStorage(context)
      
      return context
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutos - contexto cambia poco
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  // Sincronizar error de query con estado local
  useEffect(() => {
    setError(queryError as Error | null)
  }, [queryError])

  /**
   * Changes the active financial context
   * 
   * This function performs a complex operation that involves:
   * 1. Clearing localStorage to prevent stale data
   * 2. Updating the context on the server
   * 3. Removing all cached queries related to the previous context
   * 4. Invalidating context queries to trigger refetch
   * 
   * @param contextId - The ID of the financial context to activate
   * @throws Error if the context change fails
   */
  const setActiveContext = async (contextId: string) => {
    try {
      setError(null)
      
      // Limpiar localStorage antes de cambiar contexto
      saveContextToStorage(null)
      
      // Cambiar contexto en el servidor
      await FinancialContextService.setActiveContext(contextId)
      
      // Remover todas las queries relacionadas con el contexto anterior del cache
      queryClient.removeQueries({ 
        queryKey: ['movements', user?.id],
        exact: false
      })
      queryClient.removeQueries({ 
        queryKey: ['budgets', user?.id],
        exact: false
      })
      queryClient.removeQueries({ 
        queryKey: ['categories', user?.id],
        exact: false
      })
      queryClient.removeQueries({ 
        queryKey: ['statistics', user?.id],
        exact: false
      })
      queryClient.removeQueries({ 
        queryKey: ['movement-stats', user?.id],
        exact: false
      })
      queryClient.removeQueries({ 
        queryKey: ['budget-progress', user?.id],
        exact: false
      })
      queryClient.removeQueries({ 
        queryKey: ['context-members'],
        exact: false
      })
      
      // Invalidar ambas queries de contexto activo para sincronizar hooks
      await queryClient.invalidateQueries({ 
        queryKey: ['active-financial-context', user?.id],
        refetchType: 'active'
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['active-context', user?.id],
        refetchType: 'active'
      })
      
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  /**
   * Refreshes the current financial context
   * 
   * Clears both localStorage cache and React Query cache to force
   * a fresh fetch of the current context from the server
   */
  const refreshContext = async () => {
    // Limpiar cache y localStorage
    saveContextToStorage(null)
    await queryClient.invalidateQueries({ 
      queryKey: ['active-financial-context', user?.id] 
    })
    await queryClient.invalidateQueries({ 
      queryKey: ['active-context', user?.id] 
    })
  }

  // Limpiar localStorage cuando el usuario cambia
  useEffect(() => {
    if (!user) {
      saveContextToStorage(null)
    }
  }, [user])

  const value: FinancialContextState = {
    contexts: [], // TODO: Implementar lista de contextos si es necesario
    activeContext: activeContext || null,
    loading: isLoading,
    error,
    setActiveContext,
    refreshContexts: refreshContext,
  }

  return (
    <FinancialContextContext.Provider value={value}>
      {children}
    </FinancialContextContext.Provider>
  )
}

/**
 * Hook to access the active financial context
 * 
 * Provides access to the current financial context state, loading status,
 * error handling, and context management functions
 * 
 * @returns The financial context state and management functions
 * @throws Error if used outside of FinancialContextProvider
 */
export function useActiveFinancialContext() {
  const context = useContext(FinancialContextContext)
  if (context === undefined) {
    throw new Error('useActiveFinancialContext must be used within a FinancialContextProvider')
  }
  return context
}