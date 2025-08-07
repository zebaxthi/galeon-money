"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos por más tiempo
        gcTime: 15 * 60 * 1000, // 15 minutos en cache - mantener en memoria más tiempo
        retry: 1,
        refetchOnWindowFocus: false, // No refetch al enfocar ventana
        refetchOnMount: false, // No refetch al montar componente si hay datos en cache
        refetchOnReconnect: false, // No refetch al reconectar
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