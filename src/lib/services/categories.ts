import { supabase } from '@/lib/supabase'
import type { Category, CreateCategoryData } from '@/lib/types'

export class CategoryService {
  static async getCategories(userId: string, contextId?: string): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (contextId) {
      query = query.eq('context_id', contextId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getCategoriesByType(userId: string, type: 'income' | 'expense', contextId?: string): Promise<Category[]> {
    const categories = await this.getCategories(userId, contextId)
    return categories.filter(cat => cat.type === type)
  }

  static async createCategory(userId: string, categoryData: CreateCategoryData): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateCategory(id: string, updates: Partial<CreateCategoryData>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }
}