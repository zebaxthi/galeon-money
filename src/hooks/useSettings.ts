import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { AuthService } from '@/lib/services/auth'
import { FinancialContextService } from '@/lib/services/financial-contexts'

import type { UserPreferences } from '@/lib/types'

export function useSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Profile query
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => AuthService.getCurrentProfile(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Financial context query
  const {
    data: context,
    isLoading: contextLoading,
    error: contextError
  } = useQuery({
    queryKey: ['financial-context', user?.id],
    queryFn: () => FinancialContextService.getCurrentContext(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Context members query
  const {
    data: contextMembers = [],
    isLoading: membersLoading,
    error: membersError
  } = useQuery({
    queryKey: ['context-members', context?.id],
    queryFn: () => FinancialContextService.getContextMembers(context!.id),
    enabled: !!context,
    staleTime: 3 * 60 * 1000, // 3 minutos
  })

  // Derived preferences
  const notificationsPrefs = profile?.preferences?.notifications
  
  interface NotificationSettings {
    email?: boolean
    push?: boolean
    budgetAlerts?: boolean
    weeklyReports?: boolean
    monthlyReports?: boolean
  }
  
  // Obtener las preferencias de notificaciones
  let parsedNotifications: NotificationSettings | null = null
  
  // Intentar parsear las notificaciones si están en formato JSON string
  if (typeof notificationsPrefs === 'string') {
    try {
      parsedNotifications = JSON.parse(notificationsPrefs)
    } catch {
      // Si falla el parsing, usar valores por defecto
      parsedNotifications = null
    }
  } else if (notificationsPrefs && typeof notificationsPrefs === 'object' && !Array.isArray(notificationsPrefs)) {
    parsedNotifications = notificationsPrefs as NotificationSettings
  }
  
  const preferences: UserPreferences = {
    currency: 'COP', // Fijo en COP
    language: 'es', // Fijo en español
    notifications: {
      email: parsedNotifications?.email !== false,
      push: parsedNotifications?.push !== false,
      budgetAlerts: parsedNotifications?.budgetAlerts !== false,
      weeklyReports: parsedNotifications?.weeklyReports !== false,
      monthlyReports: parsedNotifications?.monthlyReports !== false
    }
  }

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updates: { name?: string }) => AuthService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    }
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<UserPreferences>) => {
      if (!profile) throw new Error('No profile loaded')
      
      // Convertir las preferencias a un formato compatible con Record<string, string | number | boolean | null>
      const flatPreferences: Record<string, string | number | boolean | null> = {
        ...profile.preferences
      }
      
      // Procesar cada preferencia
      Object.entries(newPreferences).forEach(([key, value]) => {
        if (key === 'notifications' && typeof value === 'object' && value !== null) {
          // Serializar el objeto notifications como JSON
          flatPreferences[key] = JSON.stringify(value)
        } else {
          flatPreferences[key] = value as string | number | boolean | null
        }
      })
      
      return AuthService.updateProfile({
        preferences: flatPreferences
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    }
  })

  // Update context mutation
  const updateContextMutation = useMutation({
    mutationFn: ({ contextId, updates }: { contextId: string; updates: { name?: string; description?: string } }) =>
      FinancialContextService.updateContext(contextId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-context', user?.id] })
    }
  })

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: ({ contextId, email }: { contextId: string; email: string }) =>
      FinancialContextService.inviteMember({ context_id: contextId, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['context-members', context?.id] })
    }
  })

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: ({ contextId, userId }: { contextId: string; userId: string }) =>
      FinancialContextService.removeMember(contextId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['context-members', context?.id] })
    }
  })

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: () => AuthService.signOut(),
    onSuccess: () => {
      queryClient.clear()
    }
  })

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => AuthService.deleteAccount(),
    onSuccess: () => {
      queryClient.clear()
    }
  })

  // Helper functions
  const updateProfile = async (updates: { name?: string }) => {
    return updateProfileMutation.mutateAsync(updates)
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    return updatePreferencesMutation.mutateAsync(newPreferences)
  }

  const updateContext = async (updates: { name?: string; description?: string }) => {
    if (!context) throw new Error('No context loaded')
    return updateContextMutation.mutateAsync({ contextId: context.id, updates })
  }

  const inviteMember = async (email: string) => {
    if (!context) throw new Error('No context loaded')
    return inviteMemberMutation.mutateAsync({ contextId: context.id, email })
  }

  const removeMember = async (userId: string) => {
    if (!context) throw new Error('No context loaded')
    return removeMemberMutation.mutateAsync({ contextId: context.id, userId })
  }

  const signOut = async () => {
    return signOutMutation.mutateAsync()
  }

  const deleteAccount = async () => {
    return deleteAccountMutation.mutateAsync()
  }

  // Combined loading and error states
  const loading = profileLoading || contextLoading || membersLoading
  const error = profileError || contextError || membersError || 
    updateProfileMutation.error || updatePreferencesMutation.error || 
    updateContextMutation.error || inviteMemberMutation.error || 
    removeMemberMutation.error || signOutMutation.error || 
    deleteAccountMutation.error

  return {
    // Estado
    profile,
    context,
    contextMembers,
    preferences,
    loading,
    error: error as Error | null,
    
    // Acciones
    updateProfile,
    updatePreferences,
    updateContext,
    inviteMember,
    removeMember,
    signOut,
    deleteAccount,
    
    // Utilidades
    clearError: () => {
      updateProfileMutation.reset()
      updatePreferencesMutation.reset()
      updateContextMutation.reset()
      inviteMemberMutation.reset()
      removeMemberMutation.reset()
      signOutMutation.reset()
      deleteAccountMutation.reset()
    },
    reload: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['financial-context', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['context-members', context?.id] })
    }
  }
}