"use client"

import { usePerformanceMonitoring, getPerformanceGrade } from '@/hooks/usePerformanceMonitoring'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Zap, Clock, Eye, Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceMonitorProps {
  className?: string
  showDetails?: boolean
}

export function PerformanceMonitor({ className, showDetails = false }: PerformanceMonitorProps) {
  const { metrics, isLoading, error } = usePerformanceMonitoring()

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Gauge className="h-5 w-5" />
            Error de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Midiendo Rendimiento...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const grades = getPerformanceGrade(metrics)

  const getGradeColor = (grade: 'good' | 'needs-improvement' | 'poor') => {
    switch (grade) {
      case 'good': return 'bg-green-500'
      case 'needs-improvement': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getGradeText = (grade: 'good' | 'needs-improvement' | 'poor') => {
    switch (grade) {
      case 'good': return 'Excelente'
      case 'needs-improvement': return 'Mejorable'
      case 'poor': return 'Deficiente'
      default: return 'Desconocido'
    }
  }

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  if (!showDetails) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Gauge className="h-4 w-4" />
            Rendimiento General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(
                'text-white',
                getGradeColor(grades.overall)
              )}
            >
              {getGradeText(grades.overall)}
            </Badge>
            {metrics.pageLoadTime && (
              <span className="text-sm text-muted-foreground">
                {metrics.pageLoadTime.toFixed(0)}ms
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Monitoreo de Rendimiento
        </CardTitle>
        <CardDescription>
          Métricas de Core Web Vitals y rendimiento de la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Web Vitals */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Core Web Vitals
          </h4>
          
          <div className="grid gap-4 md:grid-cols-3">
            {/* LCP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LCP</span>
                <Badge 
                  variant="secondary" 
                  className={cn('text-white text-xs', getGradeColor(grades.lcp))}
                >
                  {getGradeText(grades.lcp)}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A'}
              </div>
              <Progress 
                value={metrics.lcp ? Math.min((metrics.lcp / 4000) * 100, 100) : 0} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">Largest Contentful Paint</p>
            </div>

            {/* FID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FID</span>
                <Badge 
                  variant="secondary" 
                  className={cn('text-white text-xs', getGradeColor(grades.fid))}
                >
                  {getGradeText(grades.fid)}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {metrics.fid ? `${metrics.fid.toFixed(0)}ms` : 'N/A'}
              </div>
              <Progress 
                value={metrics.fid ? Math.min((metrics.fid / 300) * 100, 100) : 0} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">First Input Delay</p>
            </div>

            {/* CLS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CLS</span>
                <Badge 
                  variant="secondary" 
                  className={cn('text-white text-xs', getGradeColor(grades.cls))}
                >
                  {getGradeText(grades.cls)}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
              </div>
              <Progress 
                value={metrics.cls ? Math.min((metrics.cls / 0.25) * 100, 100) : 0} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">Cumulative Layout Shift</p>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Métricas de Carga
          </h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-sm font-medium">Tiempo de Carga Total</span>
              <div className="text-lg font-semibold">
                {metrics.pageLoadTime ? `${metrics.pageLoadTime.toFixed(0)}ms` : 'N/A'}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm font-medium">DOM Content Loaded</span>
              <div className="text-lg font-semibold">
                {metrics.domContentLoaded ? `${metrics.domContentLoaded.toFixed(0)}ms` : 'N/A'}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm font-medium">First Contentful Paint</span>
              <div className="text-lg font-semibold">
                {metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'N/A'}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm font-medium">Time to First Byte</span>
              <div className="text-lg font-semibold">
                {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        {metrics.usedJSHeapSize && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Uso de Memoria
            </h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <span className="text-sm font-medium">Memoria JS Utilizada</span>
                <div className="text-lg font-semibold">
                  {formatBytes(metrics.usedJSHeapSize)}
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-medium">Memoria JS Total</span>
                <div className="text-lg font-semibold">
                  {metrics.totalJSHeapSize ? formatBytes(metrics.totalJSHeapSize) : 'N/A'}
                </div>
              </div>
            </div>
            
            {metrics.totalJSHeapSize && (
              <Progress 
                value={(metrics.usedJSHeapSize / metrics.totalJSHeapSize) * 100} 
                className="h-2"
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}