import { useOptimizedQuery } from './useOptimizedQuery'
import { useAuth } from '@/providers/auth-provider'
import { useActiveFinancialContext } from '@/providers/financial-context-provider'
import { queryOptimizer } from '@/lib/services/query-optimizer'
import { CacheKeys } from '@/lib/services/cache'
import { useMemo, useCallback } from 'react'
import type { Movement } from '@/lib/types'

interface UseOptimizedMovementsOptions {
  limit?: number
  startDate?: string
  endDate?: string
  categoryIds?: string[]
  includeProfiles?: boolean
  enabled?: boolean
}

/**
 * Optimized hook for fetching movements with intelligent caching and performance optimizations
 */
export function useOptimizedMovements(options: UseOptimizedMovementsOptions = {}) {
  const { user } = useAuth()
  const { activeContext } = useActiveFinancialContext()
  
  const {
    limit = 50,
    startDate,
    endDate,
    categoryIds,
    includeProfiles = true,
    enabled = true
  } = options

  // Memoize query key for better performance
  const queryKey = useMemo(() => {
    return CacheKeys.movements(user?.id || '', activeContext?.id).concat([
      'optimized',
      limit.toString(),
      startDate || '',
      endDate || '',
      categoryIds?.join(',') || '',
      includeProfiles.toString()
    ])
  }, [user?.id, activeContext?.id, limit, startDate, endDate, categoryIds, includeProfiles])

  // Optimized query function
  const queryFn = useCallback(async (): Promise<Movement[]> => {
    if (!user?.id) throw new Error('User not authenticated')

    const data = await queryOptimizer.getOptimizedMovements(user.id, {
      contextId: activeContext?.id,
      limit,
      startDate,
      endDate,
      categoryIds,
      includeProfiles
    })

    return (data || []).map(movement => {
      if (!movement || typeof movement !== 'object') {
        // Skip invalid entries
        return null
      }
      const movementData = movement as Record<string, unknown>
      return {
        ...movementData,
        category: movementData.categories,
        created_by_profile: movementData.created_by_profile,
        updated_by_profile: movementData.updated_by_profile
      } as Movement
    }).filter((movement): movement is Movement => movement !== null)
  }, [user?.id, activeContext?.id, limit, startDate, endDate, categoryIds, includeProfiles])

  const query = useOptimizedQuery(
    queryKey,
    queryFn,
    'realtime', // Movements change frequently
    {
      enabled: enabled && !!user,
      staleTime: 1 * 60 * 1000, // 1 minute for movements
      cacheTime: 5 * 60 * 1000, // 5 minutes cache
    }
  )

  // Optimistic update helper
  const updateMovementOptimistically = useCallback((movementId: string, updates: Partial<Movement>) => {
    query.updateCache((oldData) => {
      if (!oldData) return []
      return oldData.map(movement => 
        movement.id === movementId 
          ? { ...movement, ...updates }
          : movement
      )
    })
  }, [query])

  // Add new movement optimistically
  const addMovementOptimistically = useCallback((newMovement: Movement) => {
    query.updateCache((oldData) => {
      if (!oldData) return [newMovement]
      return [newMovement, ...oldData].slice(0, limit)
    })
  }, [query, limit])

  // Remove movement optimistically
  const removeMovementOptimistically = useCallback((movementId: string) => {
    query.updateCache((oldData) => {
      if (!oldData) return []
      return oldData.filter(movement => movement.id !== movementId)
    })
  }, [query])

  // Prefetch related data
  const prefetchCategories = useCallback(() => {
    if (!user?.id) return
    
    query.prefetchRelated(
      CacheKeys.categories(user.id, activeContext?.id),
      async () => {
        const { CategoryService } = await import('@/lib/services/categories')
        return CategoryService.getCategories(user.id!, activeContext?.id)
      }
    )
  }, [query, user?.id, activeContext?.id])

  // Invalidate related queries when movements change
  const invalidateRelated = useCallback(() => {
    query.invalidateRelated('statistics')
    query.invalidateRelated('dashboard')
  }, [query])

  return {
    ...query,
    movements: query.data || [],
    // Optimistic update helpers
    updateMovementOptimistically,
    addMovementOptimistically,
    removeMovementOptimistically,
    // Related data helpers
    prefetchCategories,
    invalidateRelated,
    // Computed properties
    totalIncome: useMemo(() => {
      return query.data?.filter(m => m.type === 'income')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0
    }, [query.data]),
    totalExpenses: useMemo(() => {
      return query.data?.filter(m => m.type === 'expense')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0
    }, [query.data]),
    balance: useMemo(() => {
      const income = query.data?.filter(m => m.type === 'income')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0
      const expenses = query.data?.filter(m => m.type === 'expense')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0
      return income - expenses
    }, [query.data])
  }
}

/**
 * Hook for recent movements with optimized caching
 */
export function useRecentMovements(limit: number = 10) {
  return useOptimizedMovements({
    limit,
    includeProfiles: false, // Skip profiles for better performance
  })
}

/**
 * Hook for movements in a date range with optimized caching
 */
export function useMovementsByDateRange(
  startDate: string,
  endDate: string,
  options: Omit<UseOptimizedMovementsOptions, 'startDate' | 'endDate'> = {}
) {
  return useOptimizedMovements({
    ...options,
    startDate,
    endDate
  })
}

/**
 * Hook for movements by category with optimized caching
 */
export function useMovementsByCategory(
  categoryIds: string[],
  options: Omit<UseOptimizedMovementsOptions, 'categoryIds'> = {}
) {
  return useOptimizedMovements({
    ...options,
    categoryIds
  })
}