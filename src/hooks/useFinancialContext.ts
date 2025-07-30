import { useState, useEffect } from 'react'
import { FinancialContextService } from '@/lib/services/financial-contexts'
import type { FinancialContext, ContextMember } from '@/lib/types'

export function useFinancialContext() {
  const [context, setContext] = useState<FinancialContext | null>(null)
  const [members, setMembers] = useState<ContextMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContext = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const currentContext = await FinancialContextService.getCurrentContext()
      setContext(currentContext)
      
      if (currentContext) {
        const contextMembers = await FinancialContextService.getContextMembers(currentContext.id)
        setMembers(contextMembers)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading context')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContext()
  }, [])

  const updateContext = async (updates: { name?: string; description?: string }) => {
    if (!context) throw new Error('No context available')
    
    try {
      setError(null)
      const updatedContext = await FinancialContextService.updateContext(context.id, updates)
      setContext(updatedContext)
      return updatedContext
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating context')
      throw err
    }
  }

  const inviteMember = async (email: string) => {
    if (!context) throw new Error('No context available')
    
    try {
      setError(null)
      const newMember = await FinancialContextService.inviteMember({
        email,
        context_id: context.id
      })
      setMembers(prev => [...prev, newMember])
      return newMember
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inviting member')
      throw err
    }
  }

  const removeMember = async (userId: string) => {
    if (!context) throw new Error('No context available')
    
    try {
      setError(null)
      await FinancialContextService.removeMember(context.id, userId)
      setMembers(prev => prev.filter(member => member.user_id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing member')
      throw err
    }
  }

  return {
    context,
    members,
    loading,
    error,
    updateContext,
    inviteMember,
    removeMember,
    refetch: loadContext
  }
}