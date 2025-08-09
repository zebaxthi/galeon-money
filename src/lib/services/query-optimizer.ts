import { supabase } from '@/lib/supabase'
import { cacheService } from './cache'

/**
 * Query optimization service for Supabase operations
 */
export class QueryOptimizer {
  private static instance: QueryOptimizer
  private queryStats = new Map<string, { count: number; avgTime: number; lastUsed: number }>()
  private performanceStats = new Map<string, { count: number; totalTime: number; avgTime: number; slowest: number }>()

  private constructor() {}

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer()
    }
    return QueryOptimizer.instance
  }

  /**
   * Execute optimized query with performance tracking
   */
  async executeOptimizedQuery<T>(queryFn: () => Promise<T>): Promise<T> {
    const result: T = await queryFn();
    return result;
  }

  async executeQuery<T>(
    queryKey: string,
    queryFn: () => Promise<{ data: T; error: unknown }>,
    options: { useCache?: boolean; cacheTTL?: number; enableProfiling?: boolean } = {}
  ): Promise<T> {
    const { useCache = true, cacheTTL = 5 * 60 * 1000, enableProfiling = true } = options
    const startTime = performance.now()

    try {
      // Check memory cache first
      if (useCache) {
        const cached = cacheService.getMemoryCache<T>(queryKey)
        if (cached) {
          this.updateQueryStats(queryKey, performance.now() - startTime, true)
          return cached
        }
      }

      // Execute query
      const { data, error } = await queryFn()

      if (error) throw error

      // Cache result
      if (useCache && data) {
        cacheService.setMemoryCache(queryKey, data, cacheTTL)
      }

      // Update performance stats
      if (enableProfiling) {
        this.updateQueryStats(queryKey, performance.now() - startTime, false)
      }

      return data
    } catch (error) {
      console.error(`Query failed for key: ${queryKey}`, error)
      throw error
    }
  }

  /**
   * Batch execute multiple queries with optimized loading
   */
  async batchQueries<T>(queries: Record<string, { key: string; fn: () => Promise<{ data: unknown; error: unknown }>; useCache?: boolean; cacheTTL?: number }>): Promise<T> {
    const results = {} as T
    const promises = Object.entries(queries).map(async ([resultKey, queryConfig]) => {
      try {
        const data = await this.executeQuery(
          queryConfig.key,
          queryConfig.fn,
          {
            useCache: queryConfig.useCache,
            cacheTTL: queryConfig.cacheTTL
          }
        )
        results[resultKey as keyof T] = data as T[keyof T]
      } catch (error) {
        console.error(`Batch query failed for ${resultKey}:`, error)
        results[resultKey as keyof T] = null as T[keyof T]
      }
    })

    await Promise.allSettled(promises)
    return results
  }

  /**
   * Optimized movements query with intelligent joins
   */
  async getOptimizedMovements(
    userId: string,
    options: {
      contextId?: string
      limit?: number
      startDate?: string
      endDate?: string
      categoryIds?: string[]
      includeProfiles?: boolean
    } = {}
  ) {
    const {
      contextId,
      limit = 50,
      startDate,
      endDate,
      categoryIds,
      includeProfiles = true
    } = options

    const cacheKey = `movements-${userId}-${JSON.stringify(options)}`

    return this.executeQuery(
      cacheKey,
      async () => {
        let selectClause = `
          *,
          categories (
            id,
            name,
            type,
            color,
            icon
          )
        `

        // Only include profiles if needed
        if (includeProfiles) {
          selectClause += `,
            created_by_profile:profiles!movements_created_by_fkey (
              id,
              name,
              email
            ),
            updated_by_profile:profiles!movements_updated_by_fkey (
              id,
              name,
              email
            )
          `
        }

        let query = supabase
          .from('movements')
          .select(selectClause)
          .order('movement_date', { ascending: false })
          .order('created_at', { ascending: false })

        // Apply filters
        if (contextId) {
          query = query.eq('context_id', contextId)
        } else {
          query = query.eq('user_id', userId)
        }

        if (startDate) {
          query = query.gte('movement_date', startDate)
        }

        if (endDate) {
          query = query.lte('movement_date', endDate)
        }

        if (categoryIds && categoryIds.length > 0) {
          query = query.in('category_id', categoryIds)
        }

        if (limit) {
          query = query.limit(limit)
        }

        return query
      },
      { cacheTTL: 2 * 60 * 1000 } // 2 minutes for movements
    )
  }

  /**
   * Optimized statistics query with aggregations
   */
  async getOptimizedStatistics(
    userId: string,
    period: 'month' | 'year',
    contextId?: string
  ) {
    const cacheKey = `statistics-${userId}-${period}-${contextId || 'personal'}`

    return this.executeQuery(
      cacheKey,
      async () => {
        // Use RPC function for complex aggregations if available
        const { data, error } = await supabase.rpc('get_user_statistics', {
          p_user_id: userId,
          p_period: period,
          p_context_id: contextId
        })

        if (error) {
          // Fallback to client-side calculation
          const { MovementService } = await import('./movements')
          return MovementService.getStatisticsData(userId, period, contextId)
        }

        return data
      },
      { cacheTTL: 5 * 60 * 1000 } // 5 minutes for statistics
    )
  }

  /**
   * Optimized category query with usage stats
   */
  async getOptimizedCategories(
    userId: string,
    contextId?: string,
    includeUsageStats = false
  ) {
    const cacheKey = `categories-${userId}-${contextId || 'personal'}-${includeUsageStats}`

    return this.executeQuery(
      cacheKey,
      async () => {
        let selectClause = '*'
        
        if (includeUsageStats) {
          selectClause += `, 
            movements_count:movements(count),
            total_amount:movements(amount.sum())
          `
        }

        let query = supabase
          .from('categories')
          .select(selectClause)
          .order('name', { ascending: true })

        if (contextId) {
          query = query.eq('context_id', contextId)
        } else {
          query = query.eq('user_id', userId)
        }

        return query
      },
      { cacheTTL: 10 * 60 * 1000 } // 10 minutes for categories
    )
  }

  /**
   * Update query performance statistics
   */
  private updateQueryStats(queryKey: string, executionTime: number, fromCache: boolean): void {
    const existing = this.queryStats.get(queryKey)
    
    if (existing) {
      existing.count += 1
      existing.avgTime = (existing.avgTime + executionTime) / 2
      existing.lastUsed = Date.now()
    } else {
      this.queryStats.set(queryKey, {
        count: 1,
        avgTime: executionTime,
        lastUsed: Date.now()
      })
    }

    // Log slow queries
    if (executionTime > 1000 && !fromCache) {
      console.warn(`Slow query detected: ${queryKey} took ${executionTime.toFixed(2)}ms`)
    }
  }

  /**
   * Get query performance insights
   */
  getPerformanceInsights(): {
    slowQueries: Array<{ key: string; avgTime: number; count: number }>
    mostUsed: Array<{ key: string; count: number; lastUsed: number }>
    cacheHitRate: number
  } {
    const queries = Array.from(this.queryStats.entries())
    
    const slowQueries = queries
      .filter(([, stats]) => stats.avgTime > 500)
      .map(([key, stats]) => ({ key, avgTime: stats.avgTime, count: stats.count }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10)

    const mostUsed = queries
      .map(([key, stats]) => ({ key, count: stats.count, lastUsed: stats.lastUsed }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate cache hit rate (simplified)
    const totalQueries = queries.reduce((sum, [, stats]) => sum + stats.count, 0)
    const cacheStats = cacheService.getMemoryCacheStats()
    const cacheHitRate = cacheStats.size > 0 ? (cacheStats.size / totalQueries) * 100 : 0

    return {
      slowQueries,
      mostUsed,
      cacheHitRate: Math.min(cacheHitRate, 100)
    }
  }

  /**
   * Clear performance statistics
   */
  clearStats(): void {
    this.queryStats.clear()
  }

  /**
   * Suggest query optimizations
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []
    const insights = this.getPerformanceInsights()

    if (insights.slowQueries.length > 0) {
      suggestions.push(`Found ${insights.slowQueries.length} slow queries. Consider adding database indexes.`)
    }

    if (insights.cacheHitRate < 30) {
      suggestions.push('Low cache hit rate. Consider increasing cache TTL for stable data.')
    }

    if (insights.mostUsed.length > 0) {
      const topQuery = insights.mostUsed[0]
      if (topQuery.count > 100) {
        suggestions.push(`Query "${topQuery.key}" is heavily used. Consider optimizing or pre-loading.`)
      }
    }

    return suggestions
  }
}

// Export singleton instance
export const queryOptimizer = QueryOptimizer.getInstance()