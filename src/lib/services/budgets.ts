import { supabase } from '@/lib/supabase'
import type { Budget, CreateBudgetData } from '@/lib/types'

export class BudgetService {
  static async getBudgets(userId: string, contextId?: string): Promise<Budget[]> {
    let query = supabase
      .from('budgets')
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color,
          icon
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (contextId) {
      query = query.eq('context_id', contextId)
    }

    const { data, error } = await query

    if (error) throw error
    return data?.map(budget => ({
      ...budget,
      category: budget.categories
    })) || []
  }

  static async createBudget(userId: string, budgetData: CreateBudgetData): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budgetData,
        user_id: userId
      })
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color,
          icon
        )
      `)
      .single()

    if (error) throw error
    return {
      ...data,
      category: data.categories
    }
  }

  static async updateBudget(id: string, updates: Partial<CreateBudgetData>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color,
          icon
        )
      `)
      .single()

    if (error) throw error
    return {
      ...data,
      category: data.categories
    }
  }

  static async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  }

  static async updateBudgetSpent(budgetId: string, amount: number): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .update({ spent: amount })
      .eq('id', budgetId)

    if (error) throw error
  }

  static async getBudgetProgress(userId: string, contextId?: string) {
    const budgets = await this.getBudgets(userId, contextId)
    
    return budgets.map(budget => {
      const progress = (Number(budget.spent) / Number(budget.amount)) * 100
      const remaining = Number(budget.amount) - Number(budget.spent)
      const isOverBudget = Number(budget.spent) > Number(budget.amount)
      
      return {
        ...budget,
        progress: Math.min(progress, 100),
        remaining,
        isOverBudget,
        status: isOverBudget ? 'exceeded' : progress >= 80 ? 'warning' : 'good'
      }
    })
  }
}