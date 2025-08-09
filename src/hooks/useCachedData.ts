import { useCallback, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { useActiveFinancialContext } from '@/providers/financial-context-provider'
import { appCacheService } from '@/lib/services/app-cache'
import type { Movement } from '@/lib/types'
// import { useRouter } from 'next/navigation'

interface CachedDataOptions {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
}

/**
 * Hook for cached movements with intelligent cache management
 */
export function useCachedMovements(
  options: CachedDataOptions & {
    limit?: number
    dateRange?: { start: string; end: string }
  } = {}
) {
  const { user } = useAuth()
  const { activeContext } = useActiveFinancialContext()
  const queryClient = useQueryClient()
  
  const {
    enabled = true,
    limit = 50,
    dateRange,
    staleTime = 2 * 60 * 1000, // 2 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnMount = true,
    refetchOnWindowFocus = false
  } = options

  const queryKey = useMemo(() => [
    'movements',
    user?.id,
    activeContext?.id,
    limit,
    dateRange?.start,
    dateRange?.end
  ], [user?.id, activeContext?.id, limit, dateRange])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')

      // Try cache first
      const cached = appCacheService.getCachedMovements(
        user.id,
        activeContext?.id,
        dateRange ? `${dateRange.start}-${dateRange.end}` : undefined
      )

      if (cached) {
        return cached
      }

      // Fetch from database
      const { MovementService } = await import('@/lib/services/movements')
      let movements

      if (dateRange) {
        movements = await MovementService.getMovementsByDateRange(
          user.id,
          dateRange.start,
          dateRange.end,
          activeContext?.id
        )
      } else {
        movements = await MovementService.getMovements(
          user.id,
          activeContext?.id,
          limit
        )
      }

      // Cache the result
      await appCacheService.cacheMovements(
        user.id,
        activeContext?.id,
        movements,
        {
          isRecent: !dateRange && limit <= 20,
          dateRange: dateRange ? `${dateRange.start}-${dateRange.end}` : undefined
        }
      )

      return movements
    },
    enabled: enabled && !!user,
    staleTime,
    gcTime: cacheTime,
    refetchOnMount,
    refetchOnWindowFocus
  })

  // Invalidate cache when data changes
  const invalidateCache = useCallback(() => {
    appCacheService.invalidateMovements(user?.id || '', activeContext?.id)
    queryClient.invalidateQueries({ queryKey: ['movements'] })
  }, [user?.id, activeContext?.id, queryClient])

  return {
    ...query,
    movements: query.data || [],
    invalidateCache
  }
}

/**
 * Hook for cached categories with intelligent cache management
 */
export function useCachedCategories(options: CachedDataOptions = {}) {
  const { user } = useAuth()
  const { activeContext } = useActiveFinancialContext()
  const queryClient = useQueryClient()
  
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000, // 10 minutes
    cacheTime = 30 * 60 * 1000, // 30 minutes
    refetchOnMount = false,
    refetchOnWindowFocus = false
  } = options

  const queryKey = useMemo(() => [
    'categories',
    user?.id,
    activeContext?.id
  ], [user?.id, activeContext?.id])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')

      // Try cache first
      const cached = appCacheService.getCachedCategories(
        user.id,
        activeContext?.id
      )

      if (cached) {
        return cached
      }

      // Fetch from database
      const { CategoryService } = await import('@/lib/services/categories')
      const categories = await CategoryService.getCategories(
        user.id,
        activeContext?.id
      )

      // Cache the result
      await appCacheService.cacheCategories(
        user.id,
        activeContext?.id,
        categories
      )

      return categories
    },
    enabled: enabled && !!user,
    staleTime,
    gcTime: cacheTime,
    refetchOnMount,
    refetchOnWindowFocus
  })

  // Invalidate cache when data changes
  const invalidateCache = useCallback(() => {
    appCacheService.invalidateCategories(user?.id || '', activeContext?.id)
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  }, [user?.id, activeContext?.id, queryClient])

  return {
    ...query,
    categories: query.data || [],
    invalidateCache
  }
}

/**
 * Hook for cached statistics with intelligent cache management
 */
export function useCachedStatistics(
  period: 'month' | 'year' = 'month',
  options: CachedDataOptions = {}
) {
  const { user } = useAuth()
  const { activeContext } = useActiveFinancialContext()
  const queryClient = useQueryClient()
  
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 15 * 60 * 1000, // 15 minutes
    refetchOnMount = true,
    refetchOnWindowFocus = false
  } = options

  const queryKey = useMemo(() => [
    'statistics',
    user?.id,
    period,
    activeContext?.id
  ], [user?.id, period, activeContext?.id])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')

      // Try cache first
      const cached = appCacheService.getCachedStatistics(
        user.id,
        period,
        activeContext?.id
      )

      if (cached) {
        return cached
      }

      // Fetch from database
      const { MovementService } = await import('@/lib/services/movements')
      const statistics = await MovementService.getStatisticsData(
        user.id,
        period,
        activeContext?.id
      )

      // Cache the result
      await appCacheService.cacheStatistics(
        user.id,
        period,
        activeContext?.id,
        statistics
      )

      return statistics
    },
    enabled: enabled && !!user,
    staleTime,
    gcTime: cacheTime,
    refetchOnMount,
    refetchOnWindowFocus
  })

  // Invalidate cache when data changes
  const invalidateCache = useCallback(() => {
    appCacheService.invalidateStatistics(user?.id || '', activeContext?.id)
    queryClient.invalidateQueries({ queryKey: ['statistics'] })
  }, [user?.id, activeContext?.id, queryClient])

  return {
    ...query,
    statistics: query.data,
    invalidateCache
  }
}

/**
 * Hook for cache warming based on current page
 */
export function useCacheWarming() {
  const { user } = useAuth()
  const { activeContext } = useActiveFinancialContext()
  // const router = useRouter()

  const warmCache = useCallback(async (page?: string) => {
    if (!user?.id) return

    const currentPage = page || window.location.pathname.split('/').pop() || 'dashboard'
    
    await appCacheService.preloadForPage(
      currentPage,
      user.id,
      activeContext?.id
    )
  }, [user?.id, activeContext?.id])

  const warmUserCache = useCallback(async () => {
    if (!user?.id) return
    
    await appCacheService.warmUserCache(user.id, activeContext?.id)
  }, [user?.id, activeContext?.id])

  // Auto-warm cache on user/context change
  useEffect(() => {
    if (user?.id) {
      warmUserCache()
    }
  }, [user?.id, activeContext?.id, warmUserCache])

  return {
    warmCache,
    warmUserCache
  }
}

/**
 * Hook for cache management and monitoring
 */
export function useCacheManagement() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const clearAllCache = useCallback(() => {
    appCacheService.clearAllCache()
    queryClient.clear()
  }, [queryClient])

  const clearUserCache = useCallback(() => {
    if (!user?.id) return
    
    appCacheService.clearUserCache(user.id)
    queryClient.invalidateQueries()
  }, [user?.id, queryClient])

  const getCacheStats = useCallback(() => {
    return appCacheService.getCacheStats()
  }, [])

  return {
    clearAllCache,
    clearUserCache,
    getCacheStats
  }
}

/**
 * Hook for optimistic updates with cache synchronization
 */
export function useOptimisticUpdates() {
  const { user } = useAuth()
  const { activeContext } = useActiveFinancialContext()
  const queryClient = useQueryClient()

  const updateMovementOptimistically = useCallback(
    (movementId: string, updates: Record<string, unknown>) => {
      // Update React Query cache
      queryClient.setQueryData(
        ['movements', user?.id, activeContext?.id],
        (oldData: Movement[]) => {
          if (!oldData) return oldData
          return oldData.map((movement: Movement) => 
            movement.id === movementId 
              ? { ...movement, ...updates }
              : movement
          )
        }
      )

      // Update memory cache
      const cached = appCacheService.getCachedMovements(
        user?.id || '',
        activeContext?.id
      )
      
      if (cached) {
        const updated = (cached as Movement[]).map((movement: Movement) => 
          movement.id === movementId 
            ? { ...movement, ...updates }
            : movement
        )
        
        appCacheService.cacheMovements(
          user?.id || '',
          activeContext?.id,
          updated
        )
      }
    },
    [user?.id, activeContext?.id, queryClient]
  )

  const addMovementOptimistically = useCallback(
    (newMovement: Record<string, unknown>) => {
      // Update React Query cache
      queryClient.setQueryData(
        ['movements', user?.id, activeContext?.id],
        (oldData: Movement[]) => {
          if (!oldData) return [newMovement as unknown as Movement]
          return [newMovement as unknown as Movement, ...oldData]
        }
      )

      // Update memory cache
      const cached = appCacheService.getCachedMovements(
        user?.id || '',
        activeContext?.id
      )
      
      if (cached) {
        const updated = [newMovement as unknown as Movement, ...(cached as Movement[])]
        appCacheService.cacheMovements(
          user?.id || '',
          activeContext?.id,
          updated
        )
      }

      // Invalidate statistics since they depend on movements
      appCacheService.invalidateStatistics(user?.id || '', activeContext?.id)
    },
    [user?.id, activeContext?.id, queryClient]
  )

  const removeMovementOptimistically = useCallback(
    (movementId: string) => {
      // Update React Query cache
      queryClient.setQueryData(
        ['movements', user?.id, activeContext?.id],
        (oldData: Movement[]) => {
          if (!oldData) return oldData
          return oldData.filter((movement: Movement) => movement.id !== movementId)
        }
      )

      // Update memory cache
      const cached = appCacheService.getCachedMovements(
        user?.id || '',
        activeContext?.id
      )
      
      if (cached) {
        const updated = (cached as Movement[]).filter((movement: Movement) => movement.id !== movementId)
        appCacheService.cacheMovements(
          user?.id || '',
          activeContext?.id,
          updated
        )
      }

      // Invalidate statistics since they depend on movements
      appCacheService.invalidateStatistics(user?.id || '', activeContext?.id)
    },
    [user?.id, activeContext?.id, queryClient]
  )

  return {
    updateMovementOptimistically,
    addMovementOptimistically,
    removeMovementOptimistically
  }
}