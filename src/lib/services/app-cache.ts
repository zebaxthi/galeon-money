import { cacheService } from './cache'

/**
 * Application-specific cache service with intelligent caching strategies
 */
export class AppCacheService {
  private static instance: AppCacheService
  private readonly CACHE_VERSIONS = {
    movements: 'v1',
    categories: 'v1',
    statistics: 'v1',
    budgets: 'v1',
    profile: 'v1'
  }

  private constructor() {}

  static getInstance(): AppCacheService {
    if (!AppCacheService.instance) {
      AppCacheService.instance = new AppCacheService()
    }
    return AppCacheService.instance
  }

  /**
   * Generate versioned cache key
   */
  private getVersionedKey(type: keyof typeof this.CACHE_VERSIONS, key: string): string {
    return `${this.CACHE_VERSIONS[type]}-${type}-${key}`
  }

  /**
   * Cache movements with intelligent TTL based on data freshness
   */
  async cacheMovements(
    userId: string,
    contextId: string | undefined,
    movements: unknown[],
    options: { isRecent?: boolean; dateRange?: string } = {}
  ): Promise<void> {
    const { isRecent = false, dateRange } = options
    
    // Recent movements have shorter TTL
    const ttl = isRecent ? 2 * 60 * 1000 : 10 * 60 * 1000 // 2min vs 10min
    
    const cacheKey = this.getVersionedKey(
      'movements',
      `${userId}-${contextId || 'personal'}-${dateRange || 'all'}`
    )
    
    cacheService.setMemoryCache(cacheKey, movements, ttl)
    
    // Also cache individual movements for quick access
    movements.forEach(movement => {
      const movementData = movement as { id: string }
      const individualKey = this.getVersionedKey('movements', `single-${movementData.id}`)
      cacheService.setMemoryCache(individualKey, movement, ttl)
    })
  }

  /**
   * Get cached movements
   */
  getCachedMovements(
    userId: string,
    contextId: string | undefined,
    dateRange?: string
  ): unknown[] | null {
    const cacheKey = this.getVersionedKey(
      'movements',
      `${userId}-${contextId || 'personal'}-${dateRange || 'all'}`
    )
    
    return cacheService.getMemoryCache(cacheKey)
  }

  /**
   * Cache categories with long TTL (they change infrequently)
   */
  async cacheCategories(
    userId: string,
    contextId: string | undefined,
    categories: unknown[]
  ): Promise<void> {
    const cacheKey = this.getVersionedKey(
      'categories',
      `${userId}-${contextId || 'personal'}`
    )
    
    // Categories change infrequently, longer TTL
    cacheService.setMemoryCache(cacheKey, categories, 30 * 60 * 1000) // 30 minutes
    
    // Cache individual categories
    categories.forEach(category => {
      const categoryData = category as { id: string }
      const individualKey = this.getVersionedKey('categories', `single-${categoryData.id}`)
      cacheService.setMemoryCache(individualKey, category, 30 * 60 * 1000)
    })
  }

  /**
   * Get cached categories
   */
  getCachedCategories(userId: string, contextId: string | undefined): unknown[] | null {
    const cacheKey = this.getVersionedKey(
      'categories',
      `${userId}-${contextId || 'personal'}`
    )
    
    return cacheService.getMemoryCache(cacheKey)
  }

  /**
   * Cache statistics with medium TTL
   */
  async cacheStatistics(
    userId: string,
    period: string,
    contextId: string | undefined,
    statistics: unknown
  ): Promise<void> {
    const cacheKey = this.getVersionedKey(
      'statistics',
      `${userId}-${period}-${contextId || 'personal'}`
    )
    
    // Statistics update moderately, medium TTL
    cacheService.setMemoryCache(cacheKey, statistics, 5 * 60 * 1000) // 5 minutes
  }

  /**
   * Get cached statistics
   */
  getCachedStatistics(
    userId: string,
    period: string,
    contextId: string | undefined
  ): unknown | null {
    const cacheKey = this.getVersionedKey(
      'statistics',
      `${userId}-${period}-${contextId || 'personal'}`
    )
    
    return cacheService.getMemoryCache(cacheKey)
  }

  /**
   * Cache user profile with very long TTL
   */
  async cacheProfile(userId: string, profile: unknown): Promise<void> {
    const cacheKey = this.getVersionedKey('profile', userId)
    
    // Profile changes very infrequently, very long TTL
    cacheService.setMemoryCache(cacheKey, profile, 60 * 60 * 1000) // 1 hour
  }

  /**
   * Get cached profile
   */
  getCachedProfile(userId: string): unknown | null {
    const cacheKey = this.getVersionedKey('profile', userId)
    return cacheService.getMemoryCache(cacheKey)
  }

  /**
   * Invalidate cache when data changes
   */
  invalidateMovements(userId: string, contextId?: string): void {
    const patterns = [
      `movements-${userId}`,
      contextId ? `movements-${userId}-${contextId}` : `movements-${userId}-personal`,
      'statistics' // Statistics depend on movements
    ]
    
    patterns.forEach(pattern => {
      cacheService.clearMemoryCache(pattern)
    })
  }

  /**
   * Invalidate categories cache
   */
  invalidateCategories(userId: string, contextId?: string): void {
    const patterns = [
      `categories-${userId}`,
      contextId ? `categories-${userId}-${contextId}` : `categories-${userId}-personal`
    ]
    
    patterns.forEach(pattern => {
      cacheService.clearMemoryCache(pattern)
    })
  }

  /**
   * Invalidate statistics cache
   */
  invalidateStatistics(userId: string, contextId?: string): void {
    const patterns = [
      `statistics-${userId}`,
      contextId ? `statistics-${userId}-month-${contextId}` : `statistics-${userId}-month-personal`,
      contextId ? `statistics-${userId}-year-${contextId}` : `statistics-${userId}-year-personal`
    ]
    
    patterns.forEach(pattern => {
      cacheService.clearMemoryCache(pattern)
    })
  }

  /**
   * Smart cache warming based on user behavior
   */
  async warmUserCache(userId: string, contextId?: string): Promise<void> {
    try {
      // Import services dynamically to avoid circular dependencies
      const [{ MovementService }, { CategoryService }] = await Promise.all([
        import('./movements'),
        import('./categories')
      ])

      // Warm most commonly accessed data
      const warmingPromises = [
        // Recent movements (most accessed)
        MovementService.getMovements(userId, contextId, 20).then(movements => 
          this.cacheMovements(userId, contextId, movements, { isRecent: true })
        ),
        
        // Categories (accessed frequently)
        CategoryService.getCategories(userId, contextId).then(categories =>
          this.cacheCategories(userId, contextId, categories)
        ),
        
        // Current month statistics
        MovementService.getStatisticsData(userId, 'month', contextId).then(stats =>
          this.cacheStatistics(userId, 'month', contextId, stats)
        )
      ]

      await Promise.allSettled(warmingPromises)
    } catch (error) {
      console.warn('Cache warming failed:', error)
    }
  }

  /**
   * Preload related data based on current page
   */
  async preloadForPage(page: string, userId: string, contextId?: string): Promise<void> {
    try {
      switch (page) {
        case 'dashboard':
          await this.preloadDashboardData(userId, contextId)
          break
        case 'movements':
          await this.preloadMovementsData(userId, contextId)
          break
        case 'statistics':
          await this.preloadStatisticsData(userId, contextId)
          break
        case 'categories':
          await this.preloadCategoriesData(userId, contextId)
          break
      }
    } catch (error) {
      console.warn(`Preloading failed for page ${page}:`, error)
    }
  }

  private async preloadDashboardData(userId: string, contextId?: string): Promise<void> {
    const { MovementService } = await import('./movements')
    const { CategoryService } = await import('./categories')
    
    const promises = [
      MovementService.getMovements(userId, contextId, 10),
      MovementService.getStatisticsData(userId, 'month', contextId),
      CategoryService.getCategories(userId, contextId)
    ]
    
    const [movements, statistics, categories] = await Promise.allSettled(promises)
    
    if (movements.status === 'fulfilled' && Array.isArray(movements.value)) {
      this.cacheMovements(userId, contextId, movements.value, { isRecent: true })
    }
    if (statistics.status === 'fulfilled') {
      this.cacheStatistics(userId, 'month', contextId, statistics.value)
    }
    if (categories.status === 'fulfilled' && Array.isArray(categories.value)) {
      this.cacheCategories(userId, contextId, categories.value)
    }
  }

  private async preloadMovementsData(userId: string, contextId?: string): Promise<void> {
    const { MovementService } = await import('./movements')
    const { CategoryService } = await import('./categories')
    
    const promises = [
      MovementService.getMovements(userId, contextId, 50),
      CategoryService.getCategories(userId, contextId)
    ]
    
    const [movements, categories] = await Promise.allSettled(promises)
    
    if (movements.status === 'fulfilled' && Array.isArray(movements.value)) {
      this.cacheMovements(userId, contextId, movements.value)
    }
    if (categories.status === 'fulfilled' && Array.isArray(categories.value)) {
      this.cacheCategories(userId, contextId, categories.value)
    }
  }

  private async preloadStatisticsData(userId: string, contextId?: string): Promise<void> {
    const { MovementService } = await import('./movements')
    
    const promises = [
      MovementService.getStatisticsData(userId, 'month', contextId),
      MovementService.getStatisticsData(userId, 'year', contextId)
    ]
    
    const [monthStats, yearStats] = await Promise.allSettled(promises)
    
    if (monthStats.status === 'fulfilled') {
      this.cacheStatistics(userId, 'month', contextId, monthStats.value)
    }
    if (yearStats.status === 'fulfilled') {
      this.cacheStatistics(userId, 'year', contextId, yearStats.value)
    }
  }

  private async preloadCategoriesData(userId: string, contextId?: string): Promise<void> {
    const { CategoryService } = await import('./categories')
    
    const categories = await CategoryService.getCategories(userId, contextId)
    this.cacheCategories(userId, contextId, categories)
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    totalEntries: number
    memoryUsage: number
    hitRate: number
    topKeys: string[]
  } {
    const stats = cacheService.getMemoryCacheStats()
    
    return {
      totalEntries: stats.size,
      memoryUsage: stats.totalMemory,
      hitRate: 0, // Would need to track hits/misses
      topKeys: stats.keys.slice(0, 10)
    }
  }

  /**
   * Clear all application cache
   */
  clearAllCache(): void {
    cacheService.clearMemoryCache()
  }

  /**
   * Clear cache for specific user
   */
  clearUserCache(userId: string): void {
    cacheService.clearMemoryCache(userId)
  }
}

// Export singleton instance
export const appCacheService = AppCacheService.getInstance()