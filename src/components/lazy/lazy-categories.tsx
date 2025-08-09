import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const CategoriesPage = React.lazy(() => import('@/app/categorias/page'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Cargando categorías...</p>
    </div>
  </div>
)

export default function LazyCategories() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CategoriesPage />
    </Suspense>
  )
}