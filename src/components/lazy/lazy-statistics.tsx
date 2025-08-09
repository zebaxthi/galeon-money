'use client'

import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load del componente de estadísticas
const StatisticsPageComponent = lazy(() => import('@/app/estadisticas/page'))

// Componente de loading para estadísticas
const StatisticsLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Cargando estadísticas...</p>
    </div>
  </div>
)

// Componente wrapper con Suspense
export const LazyStatistics = () => {
  return (
    <Suspense fallback={<StatisticsLoading />}>
      <StatisticsPageComponent />
    </Suspense>
  )
}

export default LazyStatistics