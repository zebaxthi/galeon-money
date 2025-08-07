import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { MovementService } from '@/lib/services/movements'
import { useQueryInvalidation } from './useQueryInvalidation'
import type { CreateMovementData } from '@/lib/types'

export function useMovements(contextId?: string, limit?: number, year?: number, month?: number) {
  const { user } = useAuth()
  const { invalidateMovementRelatedQueries } = useQueryInvalidation()

  const {
    data: movements = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['movements', user?.id, contextId, limit, year, month],
    queryFn: async () => {
      if (!user) return []
      
      // Si se especifica año y mes, usar filtrado por fecha
      if (year !== undefined && month !== undefined) {
        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)
        
        return MovementService.getMovementsByDateRange(
          user.id,
          firstDayOfMonth.toISOString().split('T')[0],
          lastDayOfMonth.toISOString().split('T')[0],
          contextId
        )
      }
      
      // Si no, usar el método original
      return MovementService.getMovements(user.id, contextId, limit)
    },
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

export function useMovementStats(contextId?: string, year?: number, month?: number) {
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
    queryKey: ['movement-stats', user?.id, contextId, year, month],
    queryFn: () => user ? MovementService.getMovementStats(user.id, contextId, year, month) : null,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos de caché
    gcTime: 10 * 60 * 1000, // 10 minutos en memoria
  })

  return { 
    stats, 
    loading, 
    error: error as Error | null 
  }
}