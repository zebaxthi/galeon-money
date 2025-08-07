import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
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

  // Función memoizada para invalidar queries de categorías
  const invalidateCategories = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['categories', user?.id, contextId] 
    })
  }, [queryClient, user?.id, contextId])

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: CreateCategoryData) =>
      user ? CategoryService.createCategory(user.id, categoryData) : Promise.reject('No user'),
    onSuccess: invalidateCategories,
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateCategoryData> }) =>
      CategoryService.updateCategory(id, updates),
    onSuccess: invalidateCategories,
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => CategoryService.deleteCategory(id),
    onSuccess: invalidateCategories,
  })

  const getCategoriesByType = useCallback((type: 'income' | 'expense') => {
    return categories.filter(cat => cat.type === type)
  }, [categories])

  // Memoizar el objeto de retorno para evitar re-renders innecesarios
  return useMemo(() => ({
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
  }), [
    categories,
    loading,
    error,
    getCategoriesByType,
    createCategoryMutation.mutate,
    updateCategoryMutation.mutate,
    deleteCategoryMutation.mutate,
    createCategoryMutation.isPending,
    updateCategoryMutation.isPending,
    deleteCategoryMutation.isPending,
  ])
}