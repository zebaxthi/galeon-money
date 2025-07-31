import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { MovementService } from '@/lib/services/movements'
import { useQueryInvalidation } from './useQueryInvalidation'
import type { CreateMovementData } from '@/lib/types'

export function useMovements(contextId?: string, limit?: number) {
  const { user } = useAuth()
  const { invalidateMovementRelatedQueries } = useQueryInvalidation()

  const {
    data: movements = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['movements', user?.id, contextId, limit],
    queryFn: () => user ? MovementService.getMovements(user.id, contextId, limit) : [],
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  const createMovementMutation = useMutation({
    mutationFn: (movementData: CreateMovementData) => 
      user ? MovementService.createMovement(user.id, movementData) : Promise.reject('No user'),
    onSuccess: invalidateMovementRelatedQueries,
  })

  const updateMovementMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateMovementData> }) =>
      MovementService.updateMovement(id, updates),
    onSuccess: invalidateMovementRelatedQueries,
  })

  const deleteMovementMutation = useMutation({
    mutationFn: (id: string) => MovementService.deleteMovement(id),
    onSuccess: invalidateMovementRelatedQueries,
  })

  return {
    movements,
    loading,
    error: error as Error | null,
    createMovement: createMovementMutation.mutate,
    updateMovement: updateMovementMutation.mutate,
    deleteMovement: deleteMovementMutation.mutate,
    isCreating: createMovementMutation.isPending,
    isUpdating: updateMovementMutation.isPending,
    isDeleting: deleteMovementMutation.isPending,
  }
}

export function useMovementStats(contextId?: string) {
  const { user } = useAuth()

  const {
    data: stats = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      movementsCount: 0
    },
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['movement-stats', user?.id, contextId],
    queryFn: () => user ? MovementService.getMovementStats(user.id, contextId) : null,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  return { 
    stats, 
    loading, 
    error: error as Error | null 
  }
}