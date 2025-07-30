import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/services/auth'
import { FinancialContextService } from '@/lib/services/financial-contexts'
import { supabase } from '@/lib/supabase'
import type { Profile, FinancialContext, ContextMember } from '@/lib/types'

interface UserPreferences {
  currency: string
  language: string
  notifications: boolean
  emailNotifications: boolean
  budgetAlerts: boolean
}

export function useSettings() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [context, setContext] = useState<FinancialContext | null>(null)
  const [contextMembers, setContextMembers] = useState<ContextMember[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: 'USD',
    language: 'es',
    notifications: true,
    emailNotifications: true,
    budgetAlerts: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar perfil del usuario
      const userProfile = await AuthService.getCurrentProfile()
      setProfile(userProfile)

      // Cargar contexto financiero
      const financialContext = await FinancialContextService.getCurrentContext()
      setContext(financialContext)

      // Cargar miembros del contexto si existe
      if (financialContext) {
        const members = await FinancialContextService.getContextMembers(financialContext.id)
        setContextMembers(members)
      }

      // Cargar preferencias del usuario
      if (userProfile?.preferences) {
        setPreferences({
          currency: userProfile.preferences.currency || 'USD',
          language: userProfile.preferences.language || 'es',
          notifications: userProfile.preferences.notifications !== false,
          emailNotifications: userProfile.preferences.emailNotifications !== false,
          budgetAlerts: userProfile.preferences.budgetAlerts !== false
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  // Actualizar perfil
  const updateProfile = async (updates: { name?: string }) => {
    try {
      if (!profile) throw new Error('No profile loaded')
      
      const updatedProfile = await AuthService.updateProfile(updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Actualizar preferencias
  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      if (!profile) throw new Error('No profile loaded')

      const updatedPrefs = { ...preferences, ...newPreferences }
      setPreferences(updatedPrefs)

      await AuthService.updateProfile({
        preferences: {
          ...profile.preferences,
          ...updatedPrefs
        }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating preferences'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Actualizar contexto financiero
  const updateContext = async (updates: { name?: string; description?: string }) => {
    try {
      if (!context) throw new Error('No context loaded')
      
      const updatedContext = await FinancialContextService.updateContext(context.id, updates)
      setContext(updatedContext)
      return updatedContext
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating context'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Invitar miembro
  const inviteMember = async (email: string) => {
    try {
      if (!context) throw new Error('No context loaded')
      
      const newMember = await FinancialContextService.inviteMember({
        context_id: context.id,
        email
      })
      
      setContextMembers(prev => [...prev, newMember])
      return newMember
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inviting member'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Remover miembro
  const removeMember = async (userId: string) => {
    try {
      if (!context) throw new Error('No context loaded')
      
      await FinancialContextService.removeMember(context.id, userId)
      setContextMembers(prev => prev.filter(member => member.user_id !== userId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error removing member'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Cerrar sesión
  const signOut = async () => {
    try {
      await AuthService.signOut()
      // Redirigir se maneja en el componente padre
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error signing out'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Eliminar cuenta
  const deleteAccount = async () => {
    try {
      // Primero eliminar el perfil de la base de datos
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Eliminar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) throw profileError

      // Eliminar usuario de Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      if (authError) throw authError

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting account'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    // Estado
    profile,
    context,
    contextMembers,
    preferences,
    loading,
    error,
    
    // Acciones
    updateProfile,
    updatePreferences,
    updateContext,
    inviteMember,
    removeMember,
    signOut,
    deleteAccount,
    
    // Utilidades
    clearError: () => setError(null),
    reload: loadInitialData
  }
}