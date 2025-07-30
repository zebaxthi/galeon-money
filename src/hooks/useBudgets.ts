import { useState, useEffect } from 'react'
import { BudgetService } from '@/lib/services/budgets'
import type { Budget, CreateBudgetData } from '@/lib/types'

export function useBudgets(contextId?: string) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBudgets = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await BudgetService.getBudgets(contextId)
      setBudgets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading budgets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBudgets()
  }, [contextId])

  const createBudget = async (budgetData: CreateBudgetData) => {
    try {
      setError(null)
      const newBudget = await BudgetService.createBudget(budgetData)
      setBudgets(prev => [...prev, newBudget])
      return newBudget
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating budget')
      throw err
    }
  }

  const updateBudget = async (id: string, updates: Partial<CreateBudgetData>) => {
    try {
      setError(null)
      const updatedBudget = await BudgetService.updateBudget(id, updates)
      setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b))
      return updatedBudget
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating budget')
      throw err
    }
  }

  const deleteBudget = async (id: string) => {
    try {
      setError(null)
      await BudgetService.deleteBudget(id)
      setBudgets(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting budget')
      throw err
    }
  }

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch: loadBudgets
  }
}

export function useBudgetProgress(contextId?: string) {
  const [budgetProgress, setBudgetProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBudgetProgress = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await BudgetService.getBudgetProgress(contextId)
        setBudgetProgress(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading budget progress')
      } finally {
        setLoading(false)
      }
    }

    loadBudgetProgress()
  }, [contextId])

  return { budgetProgress, loading, error }
}