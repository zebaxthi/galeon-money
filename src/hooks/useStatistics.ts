import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/providers/auth-provider'
import { MovementService } from '@/lib/services/movements'

import type { StatisticsData } from '@/lib/types'

export function useStatistics(period: 'month' | 'year' = 'month', contextId?: string) {
  const { user } = useAuth()

  const {
    data = {
      resumenEstadisticas: {
        totalIngresos: 0,
        totalEgresos: 0,
        saldoNeto: 0,
        promedioMensual: 0
      },
      datosIngresoEgreso: [],
      datosCategorias: [],
      tendenciaMensual: []
    },
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['statistics', user?.id, period, contextId],
    queryFn: async (): Promise<StatisticsData> => {
      if (!user) throw new Error('No authenticated user')

      // Single optimized call instead of 3 separate calls
      const statisticsData = await MovementService.getStatisticsData(user.id, period, contextId)

      // Transform data for charts
      const tendenciaMensual = statisticsData.monthlyComparison.map(item => ({
        mes: item.mes,
        saldo: item.saldo
      }))

      return {
        resumenEstadisticas: {
          totalIngresos: statisticsData.detailedStats.totalIncome,
          totalEgresos: statisticsData.detailedStats.totalExpenses,
          saldoNeto: statisticsData.detailedStats.balance,
          promedioMensual: statisticsData.detailedStats.averageMonthly
        },
        datosIngresoEgreso: statisticsData.monthlyComparison,
        datosCategorias: statisticsData.categoryStats,
        tendenciaMensual
      }
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // 3 minutos
  })

  return { 
    data, 
    loading, 
    error: error as Error | null 
  }
}