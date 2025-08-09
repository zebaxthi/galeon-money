import React, { Suspense } from 'react'
import { MovementsSkeleton } from '@/components/loading/movements-skeleton'

const MovementsPage = React.lazy(() => import('@/app/movimientos/page'))

export default function LazyMovements() {
  return (
    <Suspense fallback={<MovementsSkeleton />}>
      <MovementsPage />
    </Suspense>
  )
}