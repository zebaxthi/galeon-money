"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { queryOptimizer } from '@/lib/services/query-optimizer'
import { cacheService } from '@/lib/services/cache'
import { Database, Clock, TrendingUp, AlertTriangle, RefreshCw, Zap } from 'lucide-react'

interface QueryPerformanceMonitorProps {
  showDetails?: boolean
  refreshInterval?: number
}

export function QueryPerformanceMonitor({ 
  showDetails = true, 
  refreshInterval = 30000 
}: QueryPerformanceMonitorProps) {
  const [performanceData, setPerformanceData] = useState<{
    slowQueries: Array<{ key: string; avgTime: number; count: number }>
    mostUsed: Array<{ key: string; count: number; lastUsed: number }>
    cacheHitRate: number
  }>({ slowQueries: [], mostUsed: [], cacheHitRate: 0 })
  
  const [cacheStats, setCacheStats] = useState<{
    size: number
    keys: string[]
    totalMemory: number
  }>({ size: 0, keys: [], totalMemory: 0 })
  
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const insights = queryOptimizer.getPerformanceInsights()
      const stats = cacheService.getMemoryCacheStats()
      const optimizationSuggestions = queryOptimizer.getOptimizationSuggestions()
      
      setPerformanceData(insights)
      setCacheStats(stats)
      setSuggestions(optimizationSuggestions)
    } catch (error) {
      console.error('Error refreshing performance data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const clearStats = () => {
    queryOptimizer.clearStats()
    cacheService.clearMemoryCache()
    refreshData()
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatMemory = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const getCacheHitRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600'
    if (rate >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceGrade = (avgTime: number) => {
    if (avgTime < 100) return { grade: 'A', color: 'bg-green-500' }
    if (avgTime < 300) return { grade: 'B', color: 'bg-blue-500' }
    if (avgTime < 500) return { grade: 'C', color: 'bg-yellow-500' }
    if (avgTime < 1000) return { grade: 'D', color: 'bg-orange-500' }
    return { grade: 'F', color: 'bg-red-500' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Rendimiento de Consultas</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearStats}
          >
            Limpiar Stats
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getCacheHitRateColor(performanceData.cacheHitRate)}>
                {performanceData.cacheHitRate.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={performanceData.cacheHitRate} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Lentas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.slowQueries.length}
            </div>
            <p className="text-xs text-muted-foreground">
              &gt; 500ms promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memoria Cache</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMemory(cacheStats.totalMemory)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats.size} entradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Sugerencias de Optimización:</p>
              <ul className="list-disc list-inside space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Stats */}
      {showDetails && (
        <Tabs defaultValue="slow-queries" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="slow-queries">Consultas Lentas</TabsTrigger>
            <TabsTrigger value="most-used">Más Usadas</TabsTrigger>
            <TabsTrigger value="cache-details">Detalles Cache</TabsTrigger>
          </TabsList>

          <TabsContent value="slow-queries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consultas con Peor Rendimiento</CardTitle>
                <CardDescription>
                  Consultas que toman más tiempo en ejecutarse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.slowQueries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    ¡Excelente! No hay consultas lentas detectadas.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {performanceData.slowQueries.map((query, index) => {
                      const { grade, color } = getPerformanceGrade(query.avgTime)
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate">{query.key}</p>
                            <p className="text-xs text-muted-foreground">
                              {query.count} ejecuciones
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${color} text-white`}>{grade}</Badge>
                            <span className="text-sm font-medium">
                              {formatTime(query.avgTime)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="most-used" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consultas Más Utilizadas</CardTitle>
                <CardDescription>
                  Consultas que se ejecutan con mayor frecuencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.mostUsed.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay datos de uso disponibles.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {performanceData.mostUsed.map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">{query.key}</p>
                          <p className="text-xs text-muted-foreground">
                            Último uso: {new Date(query.lastUsed).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {query.count} usos
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cache-details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Cache</CardTitle>
                <CardDescription>
                  Información detallada sobre el estado del cache
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Entradas Totales</p>
                      <p className="text-2xl font-bold">{cacheStats.size}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Memoria Utilizada</p>
                      <p className="text-2xl font-bold">{formatMemory(cacheStats.totalMemory)}</p>
                    </div>
                  </div>
                  
                  {cacheStats.keys.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Claves en Cache</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {cacheStats.keys.map((key, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}