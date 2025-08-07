import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { FinancialContextService } from '@/lib/services/financial-contexts'

export function useFinancialContexts() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Obtener todos los contextos del usuario
  const {
    data: userContexts = [],
    isLoading: contextsLoading,
    error: contextsError
  } = useQuery({
    queryKey: ['user-contexts', user?.id],
    queryFn: () => FinancialContextService.getUserContexts(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Obtener el contexto activo actual
  const {
    data: activeContext,
    isLoading: activeContextLoading,
    error: activeContextError
  } = useQuery({
    queryKey: ['active-context', user?.id],
    queryFn: () => FinancialContextService.getCurrentContext(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Obtener miembros del contexto activo
  const {
    data: activeContextMembers = [],
    isLoading: membersLoading,
    error: membersError
  } = useQuery({
    queryKey: ['context-members', activeContext?.id],
    queryFn: () => FinancialContextService.getContextMembers(activeContext!.id),
    enabled: !!activeContext,
    staleTime: 3 * 60 * 1000, // 3 minutos
  })

  // Crear nuevo contexto
  const createContextMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      FinancialContextService.createContext(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-contexts', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['active-context', user?.id] })
    }
  })

  // Actualizar contexto
  const updateContextMutation = useMutation({
    mutationFn: ({ contextId, updates }: { contextId: string; updates: { name?: string; description?: string } }) =>
      FinancialContextService.updateContext(contextId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-contexts', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['active-context', user?.id] })
    }
  })

  // Cambiar contexto activo
  const setActiveContextMutation = useMutation({
    mutationFn: (contextId: string) => FinancialContextService.setActiveContext(contextId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-context', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['context-members'] })
    }
  })

  // Eliminar contexto
  const deleteContextMutation = useMutation({
    mutationFn: (contextId: string) => FinancialContextService.deleteContext(contextId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-contexts', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['active-context', user?.id] })
    }
  })

  // Invitar miembro
  const inviteMemberMutation = useMutation({
    mutationFn: ({ contextId, email }: { contextId: string; email: string }) =>
      FinancialContextService.inviteMember({ context_id: contextId, email }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['context-members', variables.contextId] })
    }
  })

  // Remover miembro
  const removeMemberMutation = useMutation({
    mutationFn: ({ contextId, userId }: { contextId: string; userId: string }) =>
      FinancialContextService.removeMember(contextId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['context-members', variables.contextId] })
    }
  })

  // Helper functions
  const createContext = async (name: string, description?: string) => {
    return createContextMutation.mutateAsync({ name, description })
  }

  const updateContext = async (contextId: string, updates: { name?: string; description?: string }) => {
    return updateContextMutation.mutateAsync({ contextId, updates })
  }

  const setActiveContext = async (contextId: string) => {
    return setActiveContextMutation.mutateAsync(contextId)
  }

  const deleteContext = async (contextId: string) => {
    return deleteContextMutation.mutateAsync(contextId)
  }

  const inviteMember = async (contextId: string, email: string) => {
    return inviteMemberMutation.mutateAsync({ contextId, email })
  }

  const removeMember = async (contextId: string, userId: string) => {
    return removeMemberMutation.mutateAsync({ contextId, userId })
  }

  // Estados combinados
  const loading = contextsLoading || activeContextLoading || membersLoading
  const error = contextsError || activeContextError || membersError ||
    createContextMutation.error || updateContextMutation.error ||
    setActiveContextMutation.error || deleteContextMutation.error ||
    inviteMemberMutation.error || removeMemberMutation.error

  return {
    // Estado
    userContexts,
    activeContext,
    activeContextMembers,
    loading,
    error: error as Error | null,
    
    // Acciones
    createContext,
    updateContext,
    setActiveContext,
    deleteContext,
    inviteMember,
    removeMember,
    
    // Estados de carga específicos
    isCreating: createContextMutation.isPending,
    isUpdating: updateContextMutation.isPending,
    isSwitching: setActiveContextMutation.isPending,
    isDeleting: deleteContextMutation.isPending,
    isInviting: inviteMemberMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
    
    // Utilidades
    clearError: () => {
      createContextMutation.reset()
      updateContextMutation.reset()
      setActiveContextMutation.reset()
      deleteContextMutation.reset()
      inviteMemberMutation.reset()
      removeMemberMutation.reset()
    },
    reload: () => {
      queryClient.invalidateQueries({ queryKey: ['user-contexts', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['active-context', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['context-members'] })
    }
  }
}