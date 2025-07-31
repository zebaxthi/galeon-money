"use client"

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function AuthListener() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          queryClient.clear() // Limpiar cache al cerrar sesión
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [queryClient])

  return null
}