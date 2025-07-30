import { MovementService } from './movements'
import { CategoryService } from './categories'
import { BudgetService } from './budgets'
import type { Movement, Category, Budget } from '@/lib/types'

export interface ExportData {
  movements: Movement[]
  categories: Category[]
  budgets: Budget[]
  summary: CategorySummary[]
  statistics: ExportStatistics
}

export interface CategorySummary {
  categoria: string
  ingresos: number
  egresos: number
  saldo: number
  color?: string
}

export interface ExportStatistics {
  totalIngresos: number
  totalEgresos: number
  saldoNeto: number
  promedioMensual: number
  movimientosCount: number
  categoriasCount: number
  presupuestosCount: number
  periodoAnalizado: string
}

export class ExportService {
  static async getExportData(
    startDate: string,
    endDate: string,
    contextId?: string
  ): Promise<ExportData> {
    try {
      // Obtener datos en paralelo
      const [movements, categories, budgets] = await Promise.all([
        MovementService.getMovementsByDateRange(startDate, endDate, contextId),
        CategoryService.getCategories(contextId),
        BudgetService.getBudgets(contextId)
      ])

      // Generar resumen por categorías
      const summary = this.generateCategorySummary(movements, categories)

      // Generar estadísticas
      const statistics = this.generateStatistics(movements, categories, budgets, startDate, endDate)

      return {
        movements,
        categories,
        budgets,
        summary,
        statistics
      }
    } catch (error) {
      throw new Error(`Error al obtener datos para exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  private static generateCategorySummary(movements: Movement[], categories: Category[]): CategorySummary[] {
    const categoryMap = new Map<string, CategorySummary>()

    // Inicializar todas las categorías
    categories.forEach(category => {
      categoryMap.set(category.id, {
        categoria: category.name,
        ingresos: 0,
        egresos: 0,
        saldo: 0,
        color: category.color
      })
    })

    // Procesar movimientos
    movements.forEach(movement => {
      const categoryId = movement.category_id
      const categoryName = movement.categories?.name || 'Sin categoría'
      const amount = Number(movement.amount)

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoria: categoryName,
          ingresos: 0,
          egresos: 0,
          saldo: 0,
          color: movement.categories?.color
        })
      }

      const summary = categoryMap.get(categoryId)!
      
      if (movement.type === 'income') {
        summary.ingresos += amount
      } else {
        summary.egresos += amount
      }
      
      summary.saldo = summary.ingresos - summary.egresos
    })

    return Array.from(categoryMap.values())
      .filter(summary => summary.ingresos > 0 || summary.egresos > 0)
      .sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo))
  }

  private static generateStatistics(
    movements: Movement[], 
    categories: Category[], 
    budgets: Budget[],
    startDate: string,
    endDate: string
  ): ExportStatistics {
    const totalIngresos = movements
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + Number(m.amount), 0)

    const totalEgresos = movements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + Number(m.amount), 0)

    const saldoNeto = totalIngresos - totalEgresos

    // Calcular promedio mensual
    const start = new Date(startDate)
    const end = new Date(endDate)
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
    const promedioMensual = monthsDiff > 0 ? saldoNeto / monthsDiff : 0

    return {
      totalIngresos,
      totalEgresos,
      saldoNeto,
      promedioMensual,
      movimientosCount: movements.length,
      categoriasCount: categories.length,
      presupuestosCount: budgets.length,
      periodoAnalizado: `${startDate} a ${endDate}`
    }
  }

  static formatMovementForExport(movement: Movement) {
    return {
      fecha: movement.movement_date,
      tipo: movement.type === 'income' ? 'Ingreso' : 'Egreso',
      categoria: movement.categories?.name || 'Sin categoría',
      descripcion: movement.description || 'Sin descripción',
      monto: movement.type === 'income' ? Number(movement.amount) : -Number(movement.amount),
      notas: movement.notes || '',
      creadoPor: movement.created_by_profile?.name || movement.created_by_profile?.email || 'Usuario'
    }
  }

  static formatCategoryForExport(category: Category) {
    return {
      nombre: category.name,
      tipo: category.type === 'income' ? 'Ingreso' : 'Egreso',
      color: category.color,
      icono: category.icon || '🏷️'
    }
  }

  static formatBudgetForExport(budget: Budget) {
    const spent = Number(budget.spent || 0)
    const amount = Number(budget.amount)
    const percentage = amount > 0 ? (spent / amount) * 100 : 0
    const remaining = amount - spent

    return {
      categoria: budget.categories?.name || 'Sin categoría',
      presupuesto: amount,
      gastado: spent,
      restante: remaining,
      porcentajeUsado: Math.round(percentage * 100) / 100,
      estado: percentage >= 100 ? 'Excedido' : percentage >= 80 ? 'Cerca del límite' : 'En rango',
      periodo: `${budget.start_date} a ${budget.end_date}`
    }
  }
}