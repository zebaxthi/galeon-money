import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export class AuthService {
  // Manejar errores de refresh token
  static async handleAuthError(error: unknown) {
    const errorMessage = error && typeof error === 'object' && 'message' in error 
      ? String(error.message) 
      : String(error)
      
    if (errorMessage.includes('refresh_token_not_found') || 
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('Refresh Token Not Found')) {
      console.warn('Invalid refresh token detected, signing out user')
      await supabase.auth.signOut()
      return true // Indica que se manejó el error
    }
    return false // No se manejó el error
  }

  // Obtener sesión con manejo de errores
  static async getSessionSafely() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        const handled = await this.handleAuthError(error)
        if (handled) return null
        throw error
      }
      return session
    } catch (error) {
      await this.handleAuthError(error)
      return null
    }
  }
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        const handled = await this.handleAuthError(error)
        if (handled) return null
        throw error
      }
      return user
    } catch (error) {
      const handled = await this.handleAuthError(error)
      if (handled) return null
      throw error
    }
  }

  static async getCurrentProfile(): Promise<Profile | null> {
    const user = await this.getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  }

  static async updateProfile(updates: Partial<Profile>) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  static async signUp(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || ''
        }
      }
    })
    if (error) throw error
    return data
  }

  static async signInWithGoogle() {
    const { getSiteUrl } = await import('@/lib/supabase')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getSiteUrl()}/dashboard`
      }
    })
    if (error) throw error
    return data
  }

  static async deleteAccount() {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('No authenticated user')

    // Delete profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) throw profileError

    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
    if (authError) throw authError
  }
}