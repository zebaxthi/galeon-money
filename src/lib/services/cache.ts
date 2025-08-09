import { QueryClient } from '@tanstack/react-query'

/**
 * Cache service for optimizing database queries and API calls
 */
export class CacheService {
  private static instance: CacheService
  private queryClient: QueryClient | null = null
  private memoryCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  setQueryClient(client: QueryClient) {
    this.queryClient = client
  }

  /**
   * Memory cache for frequently accessed small data
   */
  setMemoryCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  getMemoryCache<T>(key: string): T | null {
    const cached = this.memoryCache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > cached.ttl
    if (isExpired) {
      this.memoryCache.delete(key)
      return null
    }

    return cached.data as T
  }

  clearMemoryCache(pattern?: string): void {
    if (!pattern) {
      this.memoryCache.clear()
      return
    }

    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key)
      }
    }
  }

  /**
   * Optimized query cache management
   */
  async prefetchQuery<T>(
    queryKey: (string | number)[],
    queryFn: () => Promise<T>,
    staleTime: number = 2 * 60 * 1000
  ): Promise<T | undefined> {
    if (!this.queryClient) return undefined

    await this.queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime
    })
    
    return this.queryClient.getQueryData(queryKey) as T
  }

  invalidateQueries(pattern: string): void {
    if (!this.queryClient) return

    this.queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        )
      }
    })
  }

  /**
   * Batch invalidation for related data
   */
  invalidateRelatedQueries(patterns: string[]): void {
    patterns.forEach(pattern => this.invalidateQueries(pattern))
  }

  /**
   * Smart cache warming for dashboard data
   */
  warmDashboardCache(userId: string, contextId?: string): void {
    if (!this.queryClient) return

    const baseKey = ['dashboard', userId, contextId].filter(Boolean)
    
    // Prefetch commonly accessed data
    const prefetchPromises = [
      // Recent movements
      this.queryClient.prefetchQuery({
        queryKey: [...baseKey, 'movements', 'recent'],
        queryFn: () => import('@/lib/services/movements').then(m => 
          m.MovementService.getMovements(userId, contextId, 10)
        ),
        staleTime: 2 * 60 * 1000
      }),
      
      // Categories
      this.queryClient.prefetchQuery({
        queryKey: [...baseKey, 'categories'],
        queryFn: () => import('@/lib/services/categories').then(c => 
          c.CategoryService.getCategories(userId, contextId)
        ),
        staleTime: 10 * 60 * 1000
      }),
      
      // Statistics
      this.queryClient.prefetchQuery({
        queryKey: [...baseKey, 'statistics', 'month'],
        queryFn: () => import('@/lib/services/movements').then(m => 
          m.MovementService.getStatisticsData(userId, 'month', contextId)
        ),
        staleTime: 3 * 60 * 1000
      })
    ]

    Promise.allSettled(prefetchPromises).catch(console.warn)
  }

  /**
   * Optimistic updates for better UX
   */
  async optimisticUpdate<T>(queryKey: string[], updater: (oldData: T) => T): Promise<void> {
    if (!this.queryClient) return

    // const previousData = this.queryClient.getQueryData(queryKey)
    this.queryClient.setQueryData(queryKey, updater)
  }

  /**
   * Background sync for offline support
   */
  async backgroundSync<T>(queryKey: string[], queryFn: () => Promise<T>): Promise<T | undefined> {
    if (!this.queryClient) return undefined

    try {
      const data = await queryFn()
      this.queryClient.setQueryData(queryKey, data)
      return data
    } catch (error) {
      console.warn('Background sync failed:', error)
      return undefined
    }
  }

  /**
   * Cache size management
   */
  getMemoryCacheSize(): number {
    return this.memoryCache.size
  }

  getMemoryCacheStats(): {
    size: number
    keys: string[]
    totalMemory: number
  } {
    const keys = Array.from(this.memoryCache.keys())
    const totalMemory = JSON.stringify(Array.from(this.memoryCache.values())).length
    
    return {
      size: this.memoryCache.size,
      keys,
      totalMemory
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.memoryCache.delete(key)
      }
    }
  }

  /**
   * Auto cleanup scheduler
   */
  startAutoCleanup(interval: number = 5 * 60 * 1000): void {
    setInterval(() => {
      this.cleanup()
    }, interval)
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance()

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  movements: (userId: string, contextId?: string): string[] => 
    ['movements', userId, contextId].filter(Boolean) as string[],
  
  categories: (userId: string, contextId?: string): string[] => 
    ['categories', userId, contextId].filter(Boolean) as string[],
  
  statistics: (userId: string, period: string, contextId?: string): string[] => 
    ['statistics', userId, period, contextId].filter(Boolean) as string[],
  
  budgets: (userId: string, contextId?: string): string[] => 
    ['budgets', userId, contextId].filter(Boolean) as string[],
  
  profile: (userId: string): string[] => ['profile', userId],
  
  contexts: (userId: string): string[] => ['contexts', userId]
} as const

/**
 * Cache invalidation patterns
 */
export const CachePatterns = {
  USER_DATA: 'user-data',
  MOVEMENTS: 'movements',
  CATEGORIES: 'categories',
  STATISTICS: 'statistics',
  BUDGETS: 'budgets',
  ALL: '*'
} as const