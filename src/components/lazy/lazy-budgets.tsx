'use client'

import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load del componente de presupuestos
const BudgetsPageComponent = lazy(() => import('@/app/presupuestos/page'))

// Componente de loading para presupuestos
const BudgetsLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Cargando presupuestos...</p>
    </div>
  </div>
)

// Componente wrapper con Suspense
export const LazyBudgets = () => {
  return (
    <Suspense fallback={<BudgetsLoading />}>
      <BudgetsPageComponent />
    </Suspense>
  )
}

export default LazyBudgets