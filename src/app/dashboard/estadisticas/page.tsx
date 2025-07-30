"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign
} from "lucide-react"

export default function EstadisticasPage() {
  const [periodo, setPeriodo] = useState('mes')

  // Datos de ejemplo para las gráficas
  const datosIngresoEgreso = [
    { mes: 'Ene', ingresos: 3500, egresos: 2800 },
    { mes: 'Feb', ingresos: 3200, egresos: 2600 },
    { mes: 'Mar', ingresos: 3800, egresos: 3100 },
    { mes: 'Abr', ingresos: 3600, egresos: 2900 },
    { mes: 'May', ingresos: 4000, egresos: 3200 },
    { mes: 'Jun', ingresos: 3700, egresos: 2800 },
  ]

  const datosCategorias = [
    { nombre: 'Alimentación', valor: 800, color: '#ef4444' },
    { nombre: 'Transporte', valor: 400, color: '#f97316' },
    { nombre: 'Entretenimiento', valor: 300, color: '#a855f7' },
    { nombre: 'Servicios', valor: 600, color: '#3b82f6' },
    { nombre: 'Otros', valor: 200, color: '#6b7280' },
  ]

  const tendenciaMensual = [
    { mes: 'Ene', saldo: 700 },
    { mes: 'Feb', saldo: 1300 },
    { mes: 'Mar', saldo: 1000 },
    { mes: 'Abr', saldo: 1700 },
    { mes: 'May', saldo: 2500 },
    { mes: 'Jun', saldo: 3400 },
  ]

  const resumenEstadisticas = {
    totalIngresos: 22800,
    totalEgresos: 17400,
    saldoNeto: 5400,
    promedioMensual: 900,
    mejorMes: 'Mayo',
    categoriaTopGasto: 'Alimentación'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Estadísticas</h1>
          <p className="text-muted-foreground">
            Análisis detallado de tus finanzas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={periodo === 'semana' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriodo('semana')}
          >
            Semana
          </Button>
          <Button 
            variant={periodo === 'mes' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriodo('mes')}
          >
            Mes
          </Button>
          <Button 
            variant={periodo === 'año' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriodo('año')}
          >
            Año
          </Button>
        </div>
      </div>

      {/* Resumen de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${resumenEstadisticas.totalIngresos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 6 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${resumenEstadisticas.totalEgresos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 6 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Neto</CardTitle>
            <DollarSign className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              ${resumenEstadisticas.saldoNeto.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Ahorro total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Mensual</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${resumenEstadisticas.promedioMensual.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Ahorro promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <Tabs defaultValue="comparativa" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparativa">Ingresos vs Egresos</TabsTrigger>
          <TabsTrigger value="categorias">Por Categorías</TabsTrigger>
          <TabsTrigger value="tendencia">Tendencia</TabsTrigger>
        </TabsList>

        <TabsContent value="comparativa">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa Ingresos vs Egresos</CardTitle>
              <CardDescription>
                Análisis mensual de tus ingresos y gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={datosIngresoEgreso}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" />
                  <Bar dataKey="egresos" fill="#ef4444" name="Egresos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
                <CardDescription>
                  Distribución de tus gastos principales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosCategorias}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="valor"
                      label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                    >
                      {datosCategorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Gasto']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalle por Categoría</CardTitle>
                <CardDescription>
                  Montos específicos de cada categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {datosCategorias.map((categoria, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoria.color }}
                        />
                        <span className="font-medium">{categoria.nombre}</span>
                      </div>
                      <span className="font-bold">${categoria.valor.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tendencia">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Saldo</CardTitle>
              <CardDescription>
                Evolución de tu saldo a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={tendenciaMensual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Saldo']} />
                  <Area 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}