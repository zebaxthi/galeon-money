import { useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { ExportService } from '@/lib/services/export'
import * as XLSX from 'xlsx'

export function useExport() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateExport = async (
    startDate: string,
    endDate: string,
    reportType: 'completo' | 'movimientos' | 'resumen',
    options: {
      incluirCategorias: boolean
      incluirPresupuestos: boolean
      incluirEstadisticas: boolean
    },
    contextId?: string
  ) => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      setLoading(true)
      setError(null)

      // Validar fechas
      if (!startDate || !endDate) {
        throw new Error('Las fechas de inicio y fin son requeridas')
      }

      if (new Date(startDate) > new Date(endDate)) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
      }

      // Obtener datos
      const exportData = await ExportService.getExportData(user.id, startDate, endDate, contextId)

      // Generar archivo Excel
      const workbook = XLSX.utils.book_new()

      // Hoja de movimientos
      if (reportType === 'completo' || reportType === 'movimientos') {
        const movimientosData = exportData.movements.map(ExportService.formatMovementForExport)
        const wsMovimientos = XLSX.utils.json_to_sheet(movimientosData)
        
        // Configurar ancho de columnas
        wsMovimientos['!cols'] = [
          { wch: 12 }, // fecha
          { wch: 10 }, // tipo
          { wch: 15 }, // categoria
          { wch: 25 }, // descripcion
          { wch: 12 }, // monto
          { wch: 20 }, // notas
          { wch: 15 }  // creado por
        ]
        
        XLSX.utils.book_append_sheet(workbook, wsMovimientos, 'Movimientos')
      }

      // Hoja de resumen por categorías
      if (reportType === 'completo' || reportType === 'resumen') {
        const wsResumen = XLSX.utils.json_to_sheet(exportData.summary)
        
        wsResumen['!cols'] = [
          { wch: 20 }, // categoria
          { wch: 12 }, // ingresos
          { wch: 12 }, // egresos
          { wch: 12 }, // saldo
          { wch: 10 }  // color
        ]
        
        XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen por Categoría')
      }

      // Hoja de categorías
      if (options.incluirCategorias) {
        const categoriasData = exportData.categories.map(ExportService.formatCategoryForExport)
        const wsCategorias = XLSX.utils.json_to_sheet(categoriasData)
        
        wsCategorias['!cols'] = [
          { wch: 20 }, // nombre
          { wch: 10 }, // tipo
          { wch: 10 }, // color
          { wch: 8 }   // icono
        ]
        
        XLSX.utils.book_append_sheet(workbook, wsCategorias, 'Categorías')
      }

      // Hoja de presupuestos
      if (options.incluirPresupuestos && exportData.budgets.length > 0) {
        const presupuestosData = exportData.budgets.map(ExportService.formatBudgetForExport)
        const wsPresupuestos = XLSX.utils.json_to_sheet(presupuestosData)
        
        wsPresupuestos['!cols'] = [
          { wch: 20 }, // categoria
          { wch: 12 }, // presupuesto
          { wch: 12 }, // gastado
          { wch: 12 }, // restante
          { wch: 15 }, // porcentaje usado
          { wch: 15 }, // estado
          { wch: 20 }  // periodo
        ]
        
        XLSX.utils.book_append_sheet(workbook, wsPresupuestos, 'Presupuestos')
      }

      // Hoja de estadísticas
      if (options.incluirEstadisticas) {
        const estadisticasData = [
          { concepto: 'Total Ingresos', valor: exportData.statistics.totalIngresos },
          { concepto: 'Total Egresos', valor: exportData.statistics.totalEgresos },
          { concepto: 'Saldo Neto', valor: exportData.statistics.saldoNeto },
          { concepto: 'Promedio Mensual', valor: exportData.statistics.promedioMensual },
          { concepto: 'Número de Movimientos', valor: exportData.statistics.movimientosCount },
          { concepto: 'Número de Categorías', valor: exportData.statistics.categoriasCount },
          { concepto: 'Número de Presupuestos', valor: exportData.statistics.presupuestosCount },
          { concepto: 'Período Analizado', valor: exportData.statistics.periodoAnalizado }
        ]
        
        const wsEstadisticas = XLSX.utils.json_to_sheet(estadisticasData)
        
        wsEstadisticas['!cols'] = [
          { wch: 25 }, // concepto
          { wch: 15 }  // valor
        ]
        
        XLSX.utils.book_append_sheet(workbook, wsEstadisticas, 'Estadísticas')
      }

      // Generar nombre del archivo
      const fechaActual = new Date().toISOString().split('T')[0]
      const nombreArchivo = `stonks-reporte-${fechaActual}.xlsx`

      // Descargar archivo
      XLSX.writeFile(workbook, nombreArchivo)

      return {
        success: true,
        fileName: nombreArchivo,
        data: exportData
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar el reporte'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    generateExport,
    loading,
    error
  }
}