import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { BudgetService } from '@/lib/services/budgets'
import type { Budget, CreateBudgetData } from '@/lib/types'

export function useBudgets(contextId?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: budgets = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['budgets', user?.id, contextId],
    queryFn: () => user ? BudgetService.getBudgets(user.id, contextId) : [],
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // 3 minutos
  })

  const createBudgetMutation = useMutation({
    mutationFn: (budgetData: CreateBudgetData) =>
      user ? BudgetService.createBudget(user.id, budgetData) : Promise.reject('No user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-progress'] })
    },
  })

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateBudgetData> }) =>
      BudgetService.updateBudget(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-progress'] })
    },
  })

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: string) => BudgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-progress'] })
    },
  })

  return {
    budgets,
    loading,
    error: error as Error | null,
    createBudget: createBudgetMutation.mutate,
    updateBudget: updateBudgetMutation.mutate,
    deleteBudget: deleteBudgetMutation.mutate,
    isCreating: createBudgetMutation.isPending,
    isUpdating: updateBudgetMutation.isPending,
    isDeleting: deleteBudgetMutation.isPending,
  }
}

export function useBudgetProgress(contextId?: string) {
  const { user } = useAuth()

  const {
    data: budgetProgress = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['budget-progress', user?.id, contextId],
    queryFn: () => user ? BudgetService.getBudgetProgress(user.id, contextId) : [],
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  return {
    budgetProgress,
    loading,
    error: error as Error | null
  }
}