import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'

export function useQueryInvalidation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const invalidateMovementRelatedQueries = () => {
    // Remover y luego invalidar todas las queries que dependen de movimientos
    queryClient.removeQueries({ 
      queryKey: ['movements', user?.id],
      exact: false
    })
    queryClient.removeQueries({ 
      queryKey: ['movement-stats', user?.id],
      exact: false
    })
    queryClient.invalidateQueries({ 
      queryKey: ['statistics', user?.id],
      exact: false
    })
    queryClient.invalidateQueries({ 
      queryKey: ['export-data', user?.id],
      exact: false
    })
    queryClient.invalidateQueries({ 
      queryKey: ['budget-progress', user?.id],
      exact: false
    })
  }

  const invalidateBudgetRelatedQueries = () => {
    queryClient.removeQueries({ 
      queryKey: ['budgets', user?.id],
      exact: false
    })
    queryClient.invalidateQueries({ 
      queryKey: ['budget-progress', user?.id],
      exact: false
    })
  }

  const invalidateCategoryRelatedQueries = () => {
    queryClient.removeQueries({ 
      queryKey: ['categories', user?.id],
      exact: false
    })
    // Las categorías pueden afectar estadísticas si se cambian colores/nombres
    queryClient.invalidateQueries({ 
      queryKey: ['statistics', user?.id],
      exact: false
    })
  }

  const invalidateAllFinancialData = () => {
    invalidateMovementRelatedQueries()
    invalidateBudgetRelatedQueries()
    invalidateCategoryRelatedQueries()
  }

  return {
    invalidateMovementRelatedQueries,
    invalidateBudgetRelatedQueries,
    invalidateCategoryRelatedQueries,
    invalidateAllFinancialData
  }
}