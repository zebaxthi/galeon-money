import { useQueryClient } from '@tanstack/react-query'

export function useQueryInvalidation() {
  const queryClient = useQueryClient()

  const invalidateMovementRelatedQueries = () => {
    // Invalidar todas las queries que dependen de movimientos
    queryClient.invalidateQueries({ queryKey: ['movements'] })
    queryClient.invalidateQueries({ queryKey: ['movement-stats'] })
    queryClient.invalidateQueries({ queryKey: ['statistics'] })
    queryClient.invalidateQueries({ queryKey: ['export-data'] })
    queryClient.invalidateQueries({ queryKey: ['budget-progress'] })
  }

  const invalidateBudgetRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
    queryClient.invalidateQueries({ queryKey: ['budget-progress'] })
  }

  const invalidateCategoryRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    // Las categorías pueden afectar estadísticas si se cambian colores/nombres
    queryClient.invalidateQueries({ queryKey: ['statistics'] })
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