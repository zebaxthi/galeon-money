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

  // Validar si existe una categoría con el mismo nombre y tipo
  static async validateCategoryUniqueness(
    userId: string, 
    name: string, 
    type: 'income' | 'expense', 
    contextId?: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId)
      .eq('type', type)
      .ilike('name', name.trim()) // Case-insensitive comparison

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
    return (data?.length || 0) === 0
  }

  // Validar datos de entrada
  static validateCategoryData(categoryData: CreateCategoryData): string[] {
    const errors: string[] = []

    // Validar nombre
    if (!categoryData.name || !categoryData.name.trim()) {
      errors.push('El nombre de la categoría es requerido')
    } else if (categoryData.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres')
    } else if (categoryData.name.trim().length > 50) {
      errors.push('El nombre no puede exceder 50 caracteres')
    }

    // Validar tipo
    if (!categoryData.type || !['income', 'expense'].includes(categoryData.type)) {
      errors.push('El tipo de categoría debe ser "income" o "expense"')
    }

    // Validar color
    if (!categoryData.color || !categoryData.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.push('El color debe ser un código hexadecimal válido')
    }

    return errors
  }

  static async createCategory(userId: string, categoryData: CreateCategoryData): Promise<Category> {
    // Validar datos de entrada
    const validationErrors = this.validateCategoryData(categoryData)
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '))
    }

    // Validar unicidad
    const isUnique = await this.validateCategoryUniqueness(
      userId, 
      categoryData.name, 
      categoryData.type, 
      categoryData.context_id
    )

    if (!isUnique) {
      throw new Error(`Ya existe una categoría de ${categoryData.type === 'income' ? 'ingresos' : 'egresos'} con el nombre "${categoryData.name.trim()}"`)
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        name: categoryData.name.trim(),
        user_id: userId,
        context_id: categoryData.context_id
      })
      .select()
      .single()
  
    if (error) throw error
    return data
  }

  static async updateCategory(id: string, updates: Partial<CreateCategoryData>): Promise<Category> {
    // Si se está actualizando el nombre o tipo, validar unicidad
    if (updates.name || updates.type) {
      // Obtener la categoría actual
      const currentCategory = await this.getCategoryById(id)
      if (!currentCategory) {
        throw new Error('Categoría no encontrada')
      }

      const newName = updates.name?.trim() || currentCategory.name
      const newType = updates.type || currentCategory.type

      // Validar datos si se proporcionan
      if (updates.name || updates.type || updates.color) {
        const dataToValidate = {
          name: newName,
          type: newType,
          color: updates.color || currentCategory.color
        } as CreateCategoryData

        const validationErrors = this.validateCategoryData(dataToValidate)
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(', '))
        }
      }

      // Validar unicidad solo si cambió el nombre o tipo
      if (updates.name?.trim() !== currentCategory.name || updates.type !== currentCategory.type) {
        const isUnique = await this.validateCategoryUniqueness(
          currentCategory.user_id,
          newName,
          newType,
          currentCategory.context_id,
          id
        )

        if (!isUnique) {
          throw new Error(`Ya existe una categoría de ${newType === 'income' ? 'ingresos' : 'egresos'} con el nombre "${newName}"`)
        }
      }
    }

    const finalUpdates = { ...updates }
    if (updates.name) {
      finalUpdates.name = updates.name.trim()
    }

    const { data, error } = await supabase
      .from('categories')
      .update(finalUpdates)
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