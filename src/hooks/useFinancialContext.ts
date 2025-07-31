"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { FinancialContextService } from '@/lib/services/financial-contexts'
import type { UpdateFinancialContextData, InviteMemberData } from '@/lib/types'

export function useFinancialContext() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Obtener contexto financiero actual
  const {
    data: context,
    isLoading: contextLoading,
    error: contextError
  } = useQuery({
    queryKey: ['current-context', user?.id],
    queryFn: () => user ? FinancialContextService.getCurrentContext(user.id) : null,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Obtener miembros del contexto
  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError
  } = useQuery({
    queryKey: ['context-members', context?.id],
    queryFn: () => context ? FinancialContextService.getContextMembers(context.id) : [],
    enabled: !!context,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutación para actualizar contexto
  const updateContextMutation = useMutation({
    mutationFn: ({ contextId, data }: { contextId: string; data: UpdateFinancialContextData }) =>
      FinancialContextService.updateContext(contextId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-context'] })
    },
  })

  // Mutación para invitar miembro
  const inviteMemberMutation = useMutation({
    mutationFn: ({ contextId, data }: { contextId: string; data: InviteMemberData }) =>
      FinancialContextService.inviteMember(contextId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['context-members'] })
    },
  })

  // Mutación para remover miembro
  const removeMemberMutation = useMutation({
    mutationFn: ({ contextId, userId }: { contextId: string; userId: string }) =>
      FinancialContextService.removeMember(contextId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['context-members'] })
    },
  })

  return {
    context,
    members,
    loading: contextLoading || membersLoading,
    error: contextError || membersError,
    updateContext: updateContextMutation.mutate,
    inviteMember: inviteMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    isUpdating: updateContextMutation.isPending,
    isInviting: inviteMemberMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
  }
}