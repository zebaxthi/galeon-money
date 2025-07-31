import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { CategoryService } from '@/lib/services/categories'
import type { CreateCategoryData } from '@/lib/types'

export function useCategories(contextId?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: categories = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['categories', user?.id, contextId],
    queryFn: () => user ? CategoryService.getCategories(user.id, contextId) : [],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: CreateCategoryData) =>
      user ? CategoryService.createCategory(user.id, categoryData) : Promise.reject('No user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateCategoryData> }) =>
      CategoryService.updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => CategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.filter(cat => cat.type === type)
  }

  return {
    categories,
    loading,
    error: error as Error | null,
    getCategoriesByType,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  }
}