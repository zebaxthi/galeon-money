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

  // Validar si existe un presupuesto activo para la misma categoría en el período
  static async validateBudgetUniqueness(
    userId: string,
    categoryId: string,
    startDate: string,
    endDate: string,
    contextId?: string,
    excludeId?: string
  ): Promise<{ isUnique: boolean; conflictingBudget?: Budget }> {
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
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`) // Verificar solapamiento de fechas

    if (contextId) {
      query = query.eq('context_id', contextId)
    } else {
      query = query.is('context_id', null)
    }

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error

    const conflictingBudgets = data || []
    
    if (conflictingBudgets.length > 0) {
      return {
        isUnique: false,
        conflictingBudget: {
          ...conflictingBudgets[0],
          category: conflictingBudgets[0].categories
        }
      }
    }

    return { isUnique: true }
  }

  // Validar datos de entrada
  static validateBudgetData(budgetData: CreateBudgetData): string[] {
    const errors: string[] = []

    // Validar nombre
    if (!budgetData.name || !budgetData.name.trim()) {
      errors.push('El nombre del presupuesto es requerido')
    } else if (budgetData.name.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres')
    } else if (budgetData.name.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres')
    }

    // Validar monto
    if (!budgetData.amount || budgetData.amount <= 0) {
      errors.push('El monto debe ser mayor a 0')
    } else if (budgetData.amount > 999999999) {
      errors.push('El monto no puede exceder 999,999,999')
    }

    // Validar período
    if (!budgetData.period || !['weekly', 'monthly', 'yearly'].includes(budgetData.period)) {
      errors.push('El período debe ser "weekly", "monthly" o "yearly"')
    }

    // Validar fechas
    const startDate = new Date(budgetData.start_date)
    const endDate = new Date(budgetData.end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(startDate.getTime())) {
      errors.push('La fecha de inicio no es válida')
    }

    if (isNaN(endDate.getTime())) {
      errors.push('La fecha de fin no es válida')
    }

    if (startDate.getTime() && endDate.getTime()) {
      if (endDate <= startDate) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio')
      }

      // Validar que las fechas no sean muy antiguas (más de 1 año atrás)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      if (startDate < oneYearAgo) {
        errors.push('La fecha de inicio no puede ser anterior a un año')
      }

      // Validar que el período no sea excesivamente largo (más de 2 años)
      const maxEndDate = new Date(startDate)
      maxEndDate.setFullYear(maxEndDate.getFullYear() + 2)
      
      if (endDate > maxEndDate) {
        errors.push('El período del presupuesto no puede exceder 2 años')
      }
    }

    return errors
  }

  static async createBudget(userId: string, budgetData: CreateBudgetData): Promise<Budget> {
    // Validar datos de entrada
    const validationErrors = this.validateBudgetData(budgetData)
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '))
    }

    // Validar que la categoría existe y es de tipo expense
    if (budgetData.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('type, name')
        .eq('id', budgetData.category_id)
        .eq('user_id', userId)
        .single()

      if (categoryError || !category) {
        throw new Error('La categoría seleccionada no existe o no tienes permisos para usarla')
      }

      if (category.type !== 'expense') {
        throw new Error('Solo se pueden crear presupuestos para categorías de egresos')
      }

      // Validar unicidad (no presupuestos solapados para la misma categoría)
      const uniquenessCheck = await this.validateBudgetUniqueness(
        userId,
        budgetData.category_id,
        budgetData.start_date,
        budgetData.end_date,
        budgetData.context_id
      )

      if (!uniquenessCheck.isUnique && uniquenessCheck.conflictingBudget) {
        const conflictingBudget = uniquenessCheck.conflictingBudget
        throw new Error(
          `Ya existe un presupuesto activo "${conflictingBudget.name}" para la categoría "${conflictingBudget.category?.name}" que se solapa con las fechas seleccionadas (${new Date(conflictingBudget.start_date).toLocaleDateString()} - ${new Date(conflictingBudget.end_date).toLocaleDateString()})`
        )
      }
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budgetData,
        name: budgetData.name.trim(),
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
    // Obtener el presupuesto actual
    const { data: currentBudget, error: fetchError } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentBudget) {
      throw new Error('Presupuesto no encontrado')
    }

    // Validar datos si se proporcionan
    if (Object.keys(updates).length > 0) {
      const dataToValidate = {
        name: updates.name?.trim() || currentBudget.name,
        amount: updates.amount || currentBudget.amount,
        category_id: updates.category_id || currentBudget.category_id,
        period: updates.period || currentBudget.period,
        start_date: updates.start_date || currentBudget.start_date,
        end_date: updates.end_date || currentBudget.end_date
      } as CreateBudgetData

      const validationErrors = this.validateBudgetData(dataToValidate)
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }

      // Validar unicidad si cambió la categoría o las fechas
      if (updates.category_id || updates.start_date || updates.end_date) {
        const categoryId = updates.category_id || currentBudget.category_id
        const startDate = updates.start_date || currentBudget.start_date
        const endDate = updates.end_date || currentBudget.end_date

        if (categoryId) {
          const uniquenessCheck = await this.validateBudgetUniqueness(
            currentBudget.user_id,
            categoryId,
            startDate,
            endDate,
            currentBudget.context_id,
            id
          )

          if (!uniquenessCheck.isUnique && uniquenessCheck.conflictingBudget) {
            const conflictingBudget = uniquenessCheck.conflictingBudget
            throw new Error(
              `Ya existe un presupuesto activo "${conflictingBudget.name}" para la categoría "${conflictingBudget.category?.name}" que se solapa con las fechas seleccionadas`
            )
          }
        }
      }
    }

    const finalUpdates = { ...updates }
    if (updates.name) {
      finalUpdates.name = updates.name.trim()
    }

    const { data, error } = await supabase
      .from('budgets')
      .update(finalUpdates)
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