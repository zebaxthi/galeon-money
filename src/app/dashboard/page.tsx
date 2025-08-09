"use client"

// React hooks
import { useState, useMemo, useCallback } from "react"

// Next.js components
import Link from "next/link"

// UI Components
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Loading components
import { DashboardSkeleton } from "@/components/loading/dashboard-skeleton"

// Custom hooks
import { useBudgetProgress } from "@/hooks/useBudgets"
import { useCategories } from "@/hooks/useCategories"
import { useMovements, useMovementStats } from "@/hooks/useMovements"

// Providers
import { useActiveFinancialContext } from "@/providers/financial-context-provider"

// Utilities
import { formatAmount, formatDate } from "@/lib/formatters"

// Icons
import {
  BarChart3,
  Calendar,
  Loader2,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet
} from "lucide-react"

export default function DashboardPage() {
  const currentDate = useMemo(() => new Date(), [])
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())

  const { activeContext, loading: contextLoading } = useActiveFinancialContext()
  
  const { movements, loading: movementsLoading } = useMovements(activeContext?.id, 5)
  const { stats, loading: statsLoading } = useMovementStats(activeContext?.id, selectedYear, selectedMonth)
  const { budgetProgress, loading: budgetLoading } = useBudgetProgress(activeContext?.id)
  const { categories } = useCategories(activeContext?.id)

  // Generar opciones de años (memoizado)
  const yearOptions = useMemo(() => {
    const options = []
    for (let i = currentDate.getFullYear() - 3; i <= currentDate.getFullYear() + 1; i++) {
      options.push(i)
    }
    return options
  }, [currentDate])

  // Nombres de meses (memoizado)
  const monthNames = useMemo(() => [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ], [])

  // Calcular progreso promedio de presupuestos (memoizado)
  const averageBudgetProgress = useMemo(() => {
    return budgetProgress.length > 0 
      ? budgetProgress.reduce((acc, budget) => {
          const percentage = (budget.spent / budget.amount) * 100
          return acc + percentage
        }, 0) / budgetProgress.length
      : 0
  }, [budgetProgress])

  // Verificar si es el mes actual (memoizado)
  const isCurrentMonth = useMemo(() => 
    selectedYear === currentDate.getFullYear() && selectedMonth === currentDate.getMonth(),
    [selectedYear, selectedMonth, currentDate]
  )

  // Handlers optimizados
  const handleMonthChange = useCallback((value: string) => {
    setSelectedMonth(parseInt(value))
  }, [])

  const handleYearChange = useCallback((value: string) => {
    setSelectedYear(parseInt(value))
  }, [])

  // Mostrar loading si el contexto está cargando
  if (contextLoading || statsLoading) {
    return <DashboardSkeleton />
  }

  // Mostrar mensaje si no hay contexto activo
  if (!activeContext) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No hay contexto financiero activo</h2>
          <p className="text-muted-foreground mb-4">
            Necesitas crear o seleccionar un contexto financiero para ver tus datos.
          </p>
          <Button asChild>
            <Link href="/ajustes">
              Ir a Configuración
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Dashboard</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-muted-foreground text-sm sm:text-base">
              Resumen de tu situación financiera - {activeContext.name}
            </p>
            <Badge variant={activeContext.user_role === 'owner' ? 'default' : 'secondary'} className="text-xs">
              {activeContext.user_role === 'owner' ? 'Propietario' : 'Miembro'}
            </Badge>
          </div>
        </div>
        
        {/* Selector de Mes y Año */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-24 sm:w-32">
              <SelectValue placeholder={monthNames[selectedMonth]} />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedYear.toString()} 
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-20 sm:w-24">
              <SelectValue placeholder={selectedYear.toString()} />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">
              {isCurrentMonth ? 'Saldo Total' : 'Saldo del Mes'}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className={`text-xl sm:text-2xl font-bold truncate ${
                  (stats?.balance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatAmount(stats?.balance ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {monthNames[selectedMonth]} {selectedYear}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold text-green-600 truncate">
                  {formatAmount(stats?.totalIncome ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {monthNames[selectedMonth]} {selectedYear}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold text-red-600 truncate">
                  {formatAmount(stats?.totalExpenses ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {monthNames[selectedMonth]} {selectedYear}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Progreso Presupuesto</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            {budgetLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold truncate">
                  {averageBudgetProgress.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Promedio general
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
              <Link href="/movimientos">
                <Plus className="mr-2 h-4 w-4" />
                Registrar Movimiento
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/presupuestos">
                <Target className="mr-2 h-4 w-4" />
                Ver Presupuestos
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/estadisticas">
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
                          {/* Información de auditoría */}
                          <div className="flex items-center space-x-1 mt-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {movement.created_by_profile?.name || 'Usuario desconocido'}
                            </span>
                            {movement.updated_by && movement.updated_by !== movement.created_by && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Editado por {movement.updated_by_profile?.name || 'Usuario desconocido'}
                                </span>
                              </>
                            )}
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
              <Link href="/movimientos">
                Ver Todos los Movimientos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}