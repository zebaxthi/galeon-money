"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { FinancialContextService } from '@/lib/services/financial-contexts'
import type { FinancialContext } from '@/lib/types'

interface FinancialContextState {
  activeContext: FinancialContext | null
  isLoading: boolean
  error: Error | null
  setActiveContext: (contextId: string) => Promise<void>
  refreshContext: () => Promise<void>
}

const FinancialContextContext = createContext<FinancialContextState | undefined>(undefined)

// Función para obtener contexto desde localStorage
const getContextFromStorage = (): FinancialContext | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('activeFinancialContext')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Función para guardar contexto en localStorage
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

  const setActiveContext = async (contextId: string) => {
    try {
      setError(null)
      await FinancialContextService.setActiveContext(contextId)
      
      // Invalidar y refetch el contexto activo
      await queryClient.invalidateQueries({ 
        queryKey: ['active-financial-context', user?.id] 
      })
      
      // Limpiar localStorage para forzar nueva carga
      saveContextToStorage(null)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const refreshContext = async () => {
    // Limpiar cache y localStorage
    saveContextToStorage(null)
    await queryClient.invalidateQueries({ 
      queryKey: ['active-financial-context', user?.id] 
    })
  }

  // Limpiar localStorage cuando el usuario cambia
  useEffect(() => {
    if (!user) {
      saveContextToStorage(null)
    }
  }, [user])

  const value: FinancialContextState = {
    activeContext: activeContext || null,
    isLoading,
    error,
    setActiveContext,
    refreshContext,
  }

  return (
    <FinancialContextContext.Provider value={value}>
      {children}
    </FinancialContextContext.Provider>
  )
}

export function useActiveFinancialContext() {
  const context = useContext(FinancialContextContext)
  if (context === undefined) {
    throw new Error('useActiveFinancialContext must be used within a FinancialContextProvider')
  }
  return context
}