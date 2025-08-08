import { supabase } from '@/lib/supabase'
import type { Movement, CreateMovementData } from '@/lib/types'

export class MovementService {
  static async getMovements(userId: string, contextId?: string, limit?: number): Promise<Movement[]> {
    let query = supabase
      .from('movements')
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color,
          icon
        ),
        created_by_profile:profiles!movements_created_by_fkey (
          id,
          name,
          email
        )
      `)
      .order('movement_date', { ascending: false })
      .order('created_at', { ascending: false })

    // Si se proporciona contextId, filtrar por contexto y dejar que RLS maneje el acceso
    if (contextId) {
      query = query.eq('context_id', contextId)
    } else {
      // Solo filtrar por user_id si no hay contextId específico
      query = query.eq('user_id', userId)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data?.map(movement => ({
      ...movement,
      category: movement.categories,
      created_by_profile: movement.created_by_profile
    })) || []
  }

  static async getMovementsByDateRange(userId: string, startDate: string, endDate: string, contextId?: string): Promise<Movement[]> {
    let query = supabase
      .from('movements')
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color,
          icon
        ),
        created_by_profile:profiles!movements_created_by_fkey (
          id,
          name,
          email
        )
      `)
      .gte('movement_date', startDate)
      .lte('movement_date', endDate)
      .order('movement_date', { ascending: false })

    // Si se proporciona contextId, filtrar por contexto y dejar que RLS maneje el acceso
    if (contextId) {
      query = query.eq('context_id', contextId)
    } else {
      // Solo filtrar por user_id si no hay contextId específico
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data?.map(movement => ({
      ...movement,
      category: movement.categories,
      created_by_profile: movement.created_by_profile
    })) || []
  }

  static async createMovement(userId: string, movementData: CreateMovementData): Promise<Movement> {
    const { data, error } = await supabase
      .from('movements')
      .insert({
        ...movementData,
        user_id: userId,
        created_by: userId,
        movement_date: movementData.movement_date || new Date().toISOString().split('T')[0],
        context_id: movementData.context_id
      })
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color,
          icon
        ),
        created_by_profile:profiles!movements_created_by_fkey (
          id,
          name,
          email
        )
      `)
      .single()
  
    if (error) throw error
    return {
      ...data,
      category: data.categories,
      created_by_profile: data.created_by_profile
    }
  }

  static async updateMovement(id: string, updates: Partial<CreateMovementData>): Promise<Movement> {
    const { data, error } = await supabase
      .from('movements')
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
        ),
        created_by_profile:profiles!movements_created_by_fkey (
          id,
          name,
          email
        )
      `)
      .single()
  
    if (error) throw error
    return {
      ...data,
      category: data.categories,
      created_by_profile: data.created_by_profile
    }
  }

  static async deleteMovement(id: string): Promise<void> {
    const { error } = await supabase
      .from('movements')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getMovementStats(userId: string, contextId?: string, year?: number, month?: number) {
    // Si no se especifica año/mes, usar el mes actual
    const currentDate = new Date()
    const targetYear = year ?? currentDate.getFullYear()
    const targetMonth = month ?? currentDate.getMonth()
    
    const firstDayOfMonth = new Date(targetYear, targetMonth, 1)
    const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0)

    const movements = await this.getMovementsByDateRange(
      userId,
      firstDayOfMonth.toISOString().split('T')[0],
      lastDayOfMonth.toISOString().split('T')[0],
      contextId
    )

    const totalIncome = movements
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + Number(m.amount), 0)

    const totalExpenses = movements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + Number(m.amount), 0)

    const balance = totalIncome - totalExpenses

    return {
      totalIncome,
      totalExpenses,
      balance,
      movementsCount: movements.length
    }
  }

  // Método optimizado que obtiene todos los datos de estadísticas en una sola llamada
  static async getStatisticsData(userId: string, period: 'month' | 'year' = 'month', contextId?: string) {
    const currentDate = new Date()
    let startDate: Date
    let endDate: Date
    let monthsCount: number

    if (period === 'month') {
      // Last 6 months
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1)
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      monthsCount = 6
    } else {
      // Last 12 months
      startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1)
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      monthsCount = 12
    }

    // Single database call to get all movements
    const movements = await this.getMovementsByDateRange(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      contextId
    )

    // Process all statistics from the same dataset
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    
    // 1. Detailed Stats
    const totalIncome = movements
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + Number(m.amount), 0)

    const totalExpenses = movements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + Number(m.amount), 0)

    const balance = totalIncome - totalExpenses
    const averageMonthly = balance / monthsCount

    // 2. Monthly Comparison
    const monthlyData = []
    for (let i = monthsCount - 1; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()

      const monthMovements = movements.filter(movement => {
        const movementDate = new Date(movement.movement_date)
        return movementDate.getFullYear() === year && movementDate.getMonth() === month
      })

      const income = monthMovements
        .filter(m => m.type === 'income')
        .reduce((sum, m) => sum + Number(m.amount), 0)

      const expenses = monthMovements
        .filter(m => m.type === 'expense')
        .reduce((sum, m) => sum + Number(m.amount), 0)
      
      monthlyData.push({
        mes: monthNames[month],
        ingresos: income,
        egresos: expenses,
        saldo: income - expenses
      })
    }

    // 3. Category Stats - INCLUIR MOVIMIENTOS SIN CATEGORÍA
    const expensesByCategory = movements
      .filter(m => m.type === 'expense') // Incluir TODOS los egresos, con y sin categoría
      .reduce((acc, movement) => {
        const categoryName = movement.category?.name || 'Sin categoría'
        const categoryColor = movement.category?.color || '#6b7280'
        const amount = Number(movement.amount)

        if (acc[categoryName]) {
          acc[categoryName].valor += amount
        } else {
          acc[categoryName] = {
            nombre: categoryName,
            valor: amount,
            color: categoryColor
          }
        }

        return acc
      }, {} as Record<string, { nombre: string; valor: number; color: string }>)

    const categoryStats = Object.values(expensesByCategory).sort((a, b) => b.valor - a.valor)

    return {
      detailedStats: {
        totalIncome,
        totalExpenses,
        balance,
        averageMonthly,
        movementsCount: movements.length
      },
      monthlyComparison: monthlyData,
      categoryStats
    }
  }

  // Mantener métodos individuales para compatibilidad, pero que usen el método optimizado
  static async getDetailedStats(userId: string, period: 'month' | 'year' = 'month', contextId?: string) {
    const data = await this.getStatisticsData(userId, period, contextId)
    return data.detailedStats
  }

  static async getMonthlyComparison(userId: string, contextId?: string) {
    const data = await this.getStatisticsData(userId, 'month', contextId)
    return data.monthlyComparison
  }

  static async getCategoryStats(userId: string, contextId?: string) {
    const data = await this.getStatisticsData(userId, 'month', contextId)
    return data.categoryStats
  }
}