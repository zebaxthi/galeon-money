"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus,
  Target,
  BarChart3
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    budgetProgress: 0
  })

  useEffect(() => {
    // TODO: Fetch real data from Supabase
    // For now, using mock data
    setStats({
      balance: 2500.00,
      income: 3500.00,
      expenses: 1000.00,
      budgetProgress: 65
    })
  }, [])

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
            <div className="text-2xl font-bold text-green-600">
              ${stats.balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +2.5% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.income.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.expenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              -5% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Presupuesto</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.budgetProgress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-violet-600 h-2 rounded-full" 
                style={{ width: `${stats.budgetProgress}%` }}
              ></div>
            </div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Supermercado</p>
                  <p className="text-sm text-muted-foreground">Alimentación</p>
                </div>
                <span className="text-red-600 font-medium">-$45.50</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Salario</p>
                  <p className="text-sm text-muted-foreground">Trabajo</p>
                </div>
                <span className="text-green-600 font-medium">+$2,500.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Gasolina</p>
                  <p className="text-sm text-muted-foreground">Transporte</p>
                </div>
                <span className="text-red-600 font-medium">-$60.00</span>
              </div>
            </div>
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