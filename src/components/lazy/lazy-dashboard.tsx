import React, { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/loading/dashboard-skeleton'

const DashboardPage = React.lazy(() => import('@/app/dashboard/page'))

export default function LazyDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  )
}