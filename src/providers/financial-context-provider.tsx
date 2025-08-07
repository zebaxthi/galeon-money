"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
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

export function FinancialContextProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [activeContext, setActiveContextState] = useState<FinancialContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadActiveContext = async () => {
    if (!user) {
      setActiveContextState(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const context = await FinancialContextService.getCurrentContext(user.id)
      setActiveContextState(context)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading active context:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const setActiveContext = async (contextId: string) => {
    try {
      setError(null)
      await FinancialContextService.setActiveContext(contextId)
      await loadActiveContext() // Recargar el contexto activo
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const refreshContext = async () => {
    await loadActiveContext()
  }

  useEffect(() => {
    loadActiveContext()
  }, [user])

  const value: FinancialContextState = {
    activeContext,
    isLoading,
    error,
    setActiveContext,
    refreshContext
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