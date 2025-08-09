"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { cacheService } from '@/lib/services/cache'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 2 * 60 * 1000, // 2 minutes - optimized for better performance
          gcTime: 10 * 60 * 1000, // 10 minutes in cache - increased for better caching
          retry: (failureCount: number, error: Error) => {
            // Smart retry logic
            const errorWithStatus = error as Error & { status?: number }
            if (errorWithStatus?.status === 404 || errorWithStatus?.status === 403) return false
            return failureCount < 2
          },
          refetchOnWindowFocus: false,
          refetchOnMount: 'always', // Always refetch for fresh data
          refetchOnReconnect: true,
          refetchInterval: false,
          // Network mode for better offline support
          networkMode: 'online',
        },
        mutations: {
          retry: 1,
          networkMode: 'online',
        },
      },
    })

    // Initialize cache service with query client
    cacheService.setQueryClient(client)

    return client
  })

  useEffect(() => {
    // Start auto cleanup for memory cache
    cacheService.startAutoCleanup()

    // Cleanup on unmount
    return () => {
      cacheService.clearMemoryCache()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}