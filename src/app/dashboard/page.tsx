"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMovements, useMovementStats } from "@/hooks/useMovements"
import { useBudgetProgress } from "@/hooks/useBudgets"
import { useCategories } from "@/hooks/useCategories"
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus,
  Target,
  BarChart3,
  Loader2
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { movements, loading: movementsLoading } = useMovements(undefined, 5)
  const { stats, loading: statsLoading } = useMovementStats()
  const { budgetProgress, loading: budgetLoading } = useBudgetProgress()
  const { categories } = useCategories()

  // Calcular progreso promedio de presupuestos
  const averageBudgetProgress = budgetProgress.length > 0 
    ? budgetProgress.reduce((acc, budget) => {
        const percentage = (budget.spent / budget.amount) * 100
        return acc + percentage
      }, 0) / budgetProgress.length
    : 0

  const formatAmount = (amount: number, type?: 'income' | 'expense') => {
    const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : ''
    return `${prefix}$${amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tu situación financiera actual
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold ${
                  (stats?.balance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatAmount(stats?.balance ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance actual
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(stats?.totalIncome ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de ingresos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatAmount(stats?.totalExpenses ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de gastos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Presupuesto</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {budgetLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {averageBudgetProgress.toFixed(1)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      averageBudgetProgress >= 100 ? 'bg-red-500' :
                      averageBudgetProgress >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(averageBudgetProgress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {budgetProgress.length} presupuesto{budgetProgress.length !== 1 ? 's' : ''} activo{budgetProgress.length !== 1 ? 's' : ''}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestiona tus finanzas de forma rápida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard/movimientos">
                <Plus className="mr-2 h-4 w-4" />
                Registrar Movimiento
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/presupuestos">
                <Target className="mr-2 h-4 w-4" />
                Ver Presupuestos
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/estadisticas">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Estadísticas
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Movimientos</CardTitle>
            <CardDescription>
              Tus transacciones más recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movementsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Cargando movimientos...</span>
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay movimientos registrados</p>
                <p className="text-sm">Registra tu primer movimiento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {movements.map((movement) => {
                  const category = categories.find(c => c.id === movement.category_id)
                  return (
                    <div key={movement.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          movement.type === 'income' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20' 
                            : 'bg-red-100 text-red-600 dark:bg-red-900/20'
                        }`}>
                          {movement.type === 'income' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {movement.description || 'Sin descripción'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {category?.icon} {category?.name || 'Sin categoría'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(movement.movement_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`font-medium text-sm ${
                        movement.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatAmount(movement.amount, movement.type)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
            <Button variant="outline" asChild className="w-full mt-4">
              <Link href="/dashboard/movimientos">
                Ver Todos los Movimientos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}