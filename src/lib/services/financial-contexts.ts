import { supabase } from '@/lib/supabase'
import type { FinancialContext, ContextMember, UpdateFinancialContextData, InviteMemberData } from '@/lib/types'

// Interfaz temporal para manejar la respuesta de Supabase
interface SupabaseContextResponse {
  context_id: string
  role: 'owner' | 'member'
  financial_contexts: FinancialContext | FinancialContext[]
}

export class FinancialContextService {
  static async getCurrentContext(userId?: string): Promise<FinancialContext | null> {
    let currentUserId = userId
    
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')
      currentUserId = user.id
    }

    // Primero intentar obtener el contexto activo desde las preferencias del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', currentUserId)
      .single()

    if (!profileError && profile?.preferences?.active_context_id) {
      // Verificar que el usuario aún tiene acceso a este contexto
      const { data: contextData, error: contextError } = await supabase
        .from('context_members')
        .select(`
          context_id,
          role,
          financial_contexts (*)
        `)
        .eq('user_id', currentUserId)
        .eq('context_id', profile.preferences.active_context_id)
        .single()

      if (!contextError && contextData && contextData.financial_contexts) {
        const typedData = contextData as SupabaseContextResponse
        const context = Array.isArray(typedData.financial_contexts) 
          ? typedData.financial_contexts[0] 
          : typedData.financial_contexts
        return {
          ...context,
          user_role: typedData.role
        } as FinancialContext
      }
    }

    // Si no hay contexto activo o no tiene acceso, obtener el primer contexto disponible
    const { data, error } = await supabase
      .from('context_members')
      .select(`
        context_id,
        role,
        financial_contexts (*)
      `)
      .eq('user_id', currentUserId)
      .order('joined_at', { ascending: true })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }

    // Establecer este como el contexto activo
    if (data && data.financial_contexts) {
      await this.setActiveContext(data.context_id)
      const typedData = data as SupabaseContextResponse
      const context = Array.isArray(typedData.financial_contexts) 
        ? typedData.financial_contexts[0] 
        : typedData.financial_contexts
      return {
        ...context,
        user_role: typedData.role
      } as FinancialContext
    }

    return null
  }

  // Optimizar para obtener contexto y miembros en una sola llamada
  static async getContextWithMembers(contextId: string) {
    const [context, members] = await Promise.all([
      supabase
        .from('financial_contexts')
        .select('*')
        .eq('id', contextId)
        .single(),
      this.getContextMembers(contextId)
    ])

    if (context.error) throw context.error
    
    return {
      context: context.data,
      members
    }
  }

  static async getContextMembers(contextId: string): Promise<ContextMember[]> {
    const { data, error } = await supabase
      .from('context_members')
      .select(`
        *,
        profiles (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .eq('context_id', contextId)
      .order('joined_at', { ascending: true })

    if (error) throw error
    return data.map(member => ({
      ...member,
      profile: member.profiles
    }))
  }

  static async updateContext(contextId: string, updates: UpdateFinancialContextData) {
    const { data, error } = await supabase
      .from('financial_contexts')
      .update(updates)
      .eq('id', contextId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async inviteMember(inviteData: InviteMemberData) {
    // First, check if user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteData.email)
      .single()

    if (profileError || !profile) {
      throw new Error('Usuario no encontrado. El usuario debe registrarse primero.')
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('context_members')
      .select('id')
      .eq('context_id', inviteData.context_id)
      .eq('user_id', profile.id)
      .maybeSingle()

    if (existingMember) {
      throw new Error('El usuario ya es miembro de este contexto financiero.')
    }

    // Add user to context
    const { data, error } = await supabase
      .from('context_members')
      .insert({
        context_id: inviteData.context_id,
        user_id: profile.id,
        role: 'member'
      })
      .select(`
        *,
        profiles (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return {
      ...data,
      profile: data.profiles
    }
  }

  static async removeMember(contextId: string, userId: string) {
    const { error } = await supabase
      .from('context_members')
      .delete()
      .eq('context_id', contextId)
      .eq('user_id', userId)

    if (error) throw error
  }

  static async createContext(name: string, description?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('financial_contexts')
      .insert({
        name,
        description,
        owner_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    // Add user as owner
    await supabase
      .from('context_members')
      .insert({
        context_id: data.id,
        user_id: user.id,
        role: 'owner'
      })

    // Set as active context if it's the user's first context
    const { data: existingContexts } = await supabase
      .from('context_members')
      .select('id')
      .eq('user_id', user.id)

    if (existingContexts && existingContexts.length === 1) {
      await this.setActiveContext(data.id)
    }

    return data
  }

  static async getUserContexts(userId?: string): Promise<FinancialContext[]> {
    let currentUserId = userId
    
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')
      currentUserId = user.id
    }

    const { data, error } = await supabase
      .from('context_members')
      .select(`
        context_id,
        role,
        financial_contexts (*)
      `)
      .eq('user_id', currentUserId)
      .order('joined_at', { ascending: false })

    if (error) {
      throw error
    }
    
    const result: FinancialContext[] = []
    
    for (const item of data) {
      const rawContext = item.financial_contexts
      if (!rawContext) {
        continue
      }
      
      // Si es un array, tomar el primer elemento
      const context = Array.isArray(rawContext) ? rawContext[0] : rawContext
      
      if (!context || typeof context !== 'object') {
        continue
      }
      
      result.push({
        id: context.id,
        name: context.name,
        description: context.description,
        owner_id: context.owner_id,
        created_at: context.created_at,
        updated_at: context.updated_at,
        user_role: item.role as 'owner' | 'member'
      })
    }

    return result
  }

  static async setActiveContext(contextId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Verificar que el usuario es miembro del contexto
    const { data: membership, error: membershipError } = await supabase
      .from('context_members')
      .select('id')
      .eq('context_id', contextId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      throw new Error('No tienes acceso a este contexto financiero')
    }

    // Actualizar el contexto activo en las preferencias del usuario
    const { error } = await supabase
      .from('profiles')
      .update({
        preferences: {
          active_context_id: contextId
        }
      })
      .eq('id', user.id)

    if (error) throw error
  }

  static async deleteContext(contextId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Verificar que el usuario es el propietario
    const { data: context, error: contextError } = await supabase
      .from('financial_contexts')
      .select('owner_id')
      .eq('id', contextId)
      .single()

    if (contextError) throw contextError
    
    if (context.owner_id !== user.id) {
      throw new Error('Solo el propietario puede eliminar el contexto')
    }

    // Si este es el contexto activo, cambiar a otro contexto
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    if (profile?.preferences?.active_context_id === contextId) {
      // Buscar otro contexto para establecer como activo
      const { data: otherContexts } = await supabase
        .from('context_members')
        .select('context_id')
        .eq('user_id', user.id)
        .neq('context_id', contextId)
        .limit(1)

      if (otherContexts && otherContexts.length > 0) {
        await this.setActiveContext(otherContexts[0].context_id)
      }
    }

    // Eliminar el contexto (esto eliminará automáticamente los miembros por CASCADE)
    const { error } = await supabase
      .from('financial_contexts')
      .delete()
      .eq('id', contextId)

    if (error) throw error
  }
}