import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/services/auth'
import type { Profile } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const userProfile = await AuthService.getCurrentProfile()
          setProfile(userProfile)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading session')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const userProfile = await AuthService.getCurrentProfile()
            setProfile(userProfile)
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading profile')
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing in')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.signUp(email, password, name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing up')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing out')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null)
      const updatedProfile = await AuthService.updateProfile(updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile')
      throw err
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  }
}