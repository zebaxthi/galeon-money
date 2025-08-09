"use client"

import { usePathname } from 'next/navigation'
import LazyDashboard from '@/components/lazy/lazy-dashboard'
import LazyMovements from '@/components/lazy/lazy-movements'
import LazyCategories from '@/components/lazy/lazy-categories'
import LazyBudgets from '@/components/lazy/lazy-budgets'
import LazyStatistics from '@/components/lazy/lazy-statistics'
import LazyExport from '@/components/lazy/lazy-export'

interface LazyPageWrapperProps {
  children: React.ReactNode
}

const LAZY_ROUTES = {
  '/dashboard': LazyDashboard,
  '/movimientos': LazyMovements,
  '/categorias': LazyCategories,
  '/presupuestos': LazyBudgets,
  '/estadisticas': LazyStatistics,
  '/exportar': LazyExport,
}

export function LazyPageWrapper({ children }: LazyPageWrapperProps) {
  const pathname = usePathname()
  
  // Check if current route should use lazy loading
  const LazyComponent = LAZY_ROUTES[pathname as keyof typeof LAZY_ROUTES]
  
  if (LazyComponent) {
    return <LazyComponent />
  }
  
  // For routes that don't need lazy loading, render children normally
  return <>{children}</>
}