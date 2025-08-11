"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

import type { AuthContextType } from '@/lib/types'

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
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error)
          // Si hay error de refresh token, limpiar la sesión
          if (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
          }
        } else {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        // En caso de error, limpiar la sesión
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación UNA SOLA VEZ
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        try {
          setSession(newSession)
          setUser(newSession?.user ?? null)
          
          if (event === 'SIGNED_OUT') {
            handleSignOut()
          }
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            handleSignIn()
          }
          
          // Manejar errores de token
          if (event === 'TOKEN_REFRESHED' && !newSession) {
            console.warn('Token refresh failed, signing out user')
            await supabase.auth.signOut()
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          // En caso de error, limpiar la sesión
          setSession(null)
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [handleSignOut, handleSignIn])

  // Convertir User de Supabase a UserData
  const userData = useMemo(() => {
    if (!user) return null
    return {
      ...user,
      user_metadata: user.user_metadata || {}
    }
  }, [user])

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    user: userData,
    session,
    loading
  }), [userData, session, loading])

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