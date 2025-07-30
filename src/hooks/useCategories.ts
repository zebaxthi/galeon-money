import { useState, useEffect } from 'react'
import { CategoryService } from '@/lib/services/categories'
import type { Category, CreateCategoryData } from '@/lib/types'

export function useCategories(contextId?: string) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await CategoryService.getCategories(contextId)
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [contextId])

  const createCategory = async (categoryData: CreateCategoryData) => {
    try {
      setError(null)
      const newCategory = await CategoryService.createCategory(categoryData)
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating category')
      throw err
    }
  }

  const updateCategory = async (id: string, updates: Partial<CreateCategoryData>) => {
    try {
      setError(null)
      const updatedCategory = await CategoryService.updateCategory(id, updates)
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c))
      return updatedCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating category')
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      setError(null)
      await CategoryService.deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting category')
      throw err
    }
  }

  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.filter(cat => cat.type === type)
  }

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
    refetch: loadCategories
  }
}