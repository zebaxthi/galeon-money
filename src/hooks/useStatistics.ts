import { useState, useEffect } from 'react'
import { MovementService } from '@/lib/services/movements'

interface StatisticsData {
  resumenEstadisticas: {
    totalIngresos: number
    totalEgresos: number
    saldoNeto: number
    promedioMensual: number
  }
  datosIngresoEgreso: Array<{
    mes: string
    ingresos: number
    egresos: number
  }>
  datosCategorias: Array<{
    nombre: string
    valor: number
    color: string
  }>
  tendenciaMensual: Array<{
    mes: string
    saldo: number
  }>
}

export function useStatistics(period: 'month' | 'year' = 'month', contextId?: string) {
  const [data, setData] = useState<StatisticsData>({
    resumenEstadisticas: {
      totalIngresos: 0,
      totalEgresos: 0,
      saldoNeto: 0,
      promedioMensual: 0
    },
    datosIngresoEgreso: [],
    datosCategorias: [],
    tendenciaMensual: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load all statistics in parallel
        const [detailedStats, monthlyComparison, categoryStats] = await Promise.all([
          MovementService.getDetailedStats(period, contextId),
          MovementService.getMonthlyComparison(contextId),
          MovementService.getCategoryStats(contextId)
        ])

        // Transform data for charts
        const tendenciaMensual = monthlyComparison.map(item => ({
          mes: item.mes,
          saldo: item.saldo
        }))

        setData({
          resumenEstadisticas: {
            totalIngresos: detailedStats.totalIncome,
            totalEgresos: detailedStats.totalExpenses,
            saldoNeto: detailedStats.balance,
            promedioMensual: detailedStats.averageMonthly
          },
          datosIngresoEgreso: monthlyComparison,
          datosCategorias: categoryStats,
          tendenciaMensual
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading statistics')
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()
  }, [period, contextId])

  return { data, loading, error }
}