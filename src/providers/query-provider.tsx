"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1 * 60 * 1000, // 1 minuto - reducir tiempo de datos frescos
        gcTime: 5 * 60 * 1000, // 5 minutos en cache - reducir tiempo en memoria
        retry: 1,
        refetchOnWindowFocus: false, // No refetch al enfocar ventana
        refetchOnMount: true, // Permitir refetch al montar para datos más actualizados
        refetchOnReconnect: true, // Permitir refetch al reconectar
        refetchInterval: false, // No refetch automático por intervalo
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}