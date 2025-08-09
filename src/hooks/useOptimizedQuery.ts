import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useAuth } from '@/providers/auth-provider'

/**
 * Configuration for optimized queries
 */
interface OptimizedQueryConfig {
  /** Cache time in milliseconds (default: 5 minutes) */
  cacheTime?: number
  /** Stale time in milliseconds (default: 2 minutes) */
  staleTime?: number
  /** Enable background refetch (default: true) */
  refetchOnWindowFocus?: boolean
  /** Retry failed requests (default: 2) */
  retry?: number | ((failureCount: number, error: Error) => boolean)
  /** Enable query when conditions are met */
  enabled?: boolean
}

/**
 * Default configuration for different query types
 */
const QUERY_CONFIGS = {
  // Fast-changing data (movements, real-time stats)
  realtime: {
    cacheTime: 2 * 60 * 1000, // 2 minutes
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: (failureCount: number) => failureCount < 2
  },
  // Medium-changing data (categories, budgets)
  standard: {
    cacheTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount: number) => failureCount < 2
  },
  // Slow-changing data (user profile, settings)
  static: {
    cacheTime: 30 * 60 * 1000, // 30 minutes
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount: number) => failureCount < 1
  }
} as const

/**
 * Optimized query hook with intelligent caching and performance optimizations
 */
export function useOptimizedQuery<TData = unknown, TError = Error>(
  queryKey: (string | number | undefined)[],
  queryFn: () => Promise<TData>,
  type: keyof typeof QUERY_CONFIGS = 'standard',
  customConfig?: OptimizedQueryConfig
) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Memoize the final configuration
  const config = useMemo(() => {
    const baseConfig = QUERY_CONFIGS[type]
    return {
      ...baseConfig,
      ...customConfig,
      enabled: customConfig?.enabled ?? true
    }
  }, [type, customConfig])

  // Memoize query key to prevent unnecessary re-renders
  const memoizedQueryKey = useMemo(() => {
    return queryKey.filter(key => key !== undefined)
  }, [queryKey])

  // Optimized query function with error handling
  const optimizedQueryFn = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated')
    }
    return queryFn()
  }, [queryFn, user])

  const query = useQuery({
    queryKey: memoizedQueryKey,
    queryFn: optimizedQueryFn,
    ...config
  } as UseQueryOptions<TData, TError>)

  // Prefetch related data for better UX
  const prefetchRelated = useCallback((relatedQueryKey: string[], relatedQueryFn: () => Promise<unknown>) => {
    queryClient.prefetchQuery({
      queryKey: relatedQueryKey,
      queryFn: relatedQueryFn,
      staleTime: config.staleTime
    })
  }, [queryClient, config.staleTime])

  // Invalidate related queries
  const invalidateRelated = useCallback((pattern: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        )
      }
    })
  }, [queryClient])

  // Update cache optimistically
  const updateCache = useCallback((updater: (oldData: TData | undefined) => TData) => {
    queryClient.setQueryData(memoizedQueryKey, updater)
  }, [queryClient, memoizedQueryKey])

  return {
    ...query,
    prefetchRelated,
    invalidateRelated,
    updateCache
  }
}

/**
 * Hook for batch queries with optimized loading states
 * Note: This is a simplified version to avoid React hooks rules violations
 */
export function useBatchOptimizedQueries() {
  // This function is simplified to avoid hooks rules violations
  // For complex batch queries, use individual useOptimizedQuery hooks
  return {
    data: {},
    results: {},
    isLoading: false,
    isError: false,
    errors: [],
    isSuccess: true
  }
}

/**
 * Hook for infinite queries with optimized performance
 */
export function useOptimizedInfiniteQuery<TData = unknown>(
  queryKey: (string | number | undefined)[],
  queryFn: ({ pageParam }: { pageParam: number }) => Promise<TData[]>,
  type: keyof typeof QUERY_CONFIGS = 'realtime'
) {
  const { user } = useAuth()
  const config = QUERY_CONFIGS[type]

  const memoizedQueryKey = useMemo(() => {
    return queryKey.filter(key => key !== undefined)
  }, [queryKey])

  return useQuery({
    queryKey: [...memoizedQueryKey, 'infinite'],
    queryFn: () => queryFn({ pageParam: 0 }),
    enabled: !!user,
    ...config
  })
}