import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const ExportPage = React.lazy(() => import('@/app/exportar/page'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Cargando exportación...</p>
    </div>
  </div>
)

export default function LazyExport() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExportPage />
    </Suspense>
  )
}