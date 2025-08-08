"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  // Memoizar funciones para evitar re-renders
  const handleSignOut = useCallback(() => {
    queryClient.clear()
  }, [queryClient])

  const handleSignIn = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['current-context'] })
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  }, [queryClient])

  useEffect(() => {
    // Obtener sesión inicial UNA SOLA VEZ
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación UNA SOLA VEZ
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        if (event === 'SIGNED_OUT') {
          handleSignOut()
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          handleSignIn()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [handleSignOut, handleSignIn])

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    user,
    session,
    loading
  }), [user, session, loading])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}