import { supabase } from '@/lib/supabase'
import type { Movement, CreateMovementData } from '@/lib/types'

export class MovementService {
  static async getMovements(contextId?: string, limit?: number): Promise<Movement[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

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
      .eq('user_id', user.id)
      .order('movement_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (contextId) {
      query = query.eq('context_id', contextId)
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

  static async getMovementsByDateRange(startDate: string, endDate: string, contextId?: string): Promise<Movement[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

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
      .eq('user_id', user.id)
      .gte('movement_date', startDate)
      .lte('movement_date', endDate)
      .order('movement_date', { ascending: false })

    if (contextId) {
      query = query.eq('context_id', contextId)
    }

    const { data, error } = await query

    if (error) throw error
    return data?.map(movement => ({
      ...movement,
      category: movement.categories,
      created_by_profile: movement.created_by_profile
    })) || []
  }

  static async createMovement(movementData: CreateMovementData): Promise<Movement> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('movements')
      .insert({
        ...movementData,
        user_id: user.id,
        created_by: user.id,
        movement_date: movementData.movement_date || new Date().toISOString().split('T')[0]
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

  static async getMovementStats(contextId?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Get current month movements
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const movements = await this.getMovementsByDateRange(
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
}