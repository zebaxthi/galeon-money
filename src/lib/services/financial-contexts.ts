import { supabase } from '@/lib/supabase'
import type { FinancialContext, ContextMember, UpdateFinancialContextData, InviteMemberData } from '@/lib/types'

export class FinancialContextService {
  static async getCurrentContext(): Promise<FinancialContext | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('context_members')
      .select(`
        context_id,
        financial_contexts (*)
      `)
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }

    return data?.financial_contexts as unknown as FinancialContext
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
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteData.email)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        throw new Error('Usuario no encontrado. El usuario debe registrarse primero.')
      }
      throw profileError
    }

    // Check if user is already a member
    const { data: existingMember, error: memberError } = await supabase
      .from('context_members')
      .select('id')
      .eq('context_id', inviteData.context_id)
      .eq('user_id', profiles.id)
      .single()

    if (existingMember) {
      throw new Error('El usuario ya es miembro de este contexto financiero.')
    }

    // Add user to context
    const { data, error } = await supabase
      .from('context_members')
      .insert({
        context_id: inviteData.context_id,
        user_id: profiles.id,
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

    return data
  }
}