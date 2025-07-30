'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
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
  AreaChart,
  Area
} from 'recharts'
import { useStatistics } from '@/hooks/useStatistics'

export default function EstadisticasPage() {
  const [periodo, setPeriodo] = useState<'month' | 'year'>('month')
  const { data, loading, error } = useStatistics(periodo)

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Estadísticas</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error al cargar estadísticas: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { resumenEstadisticas, datosIngresoEgreso, datosCategorias, tendenciaMensual } = data

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        
        {/* Selector de Período */}
        <div className="flex space-x-2">
          <Button 
            variant={periodo === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriodo('month')}
          >
            6 Meses
          </Button>
          <Button 
            variant={periodo === 'year' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriodo('year')}
          >
            12 Meses
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
              Últimos {periodo === 'month' ? '6 meses' : '12 meses'}
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
              Últimos {periodo === 'month' ? '6 meses' : '12 meses'}
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
              {datosIngresoEgreso.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={datosIngresoEgreso}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" />
                    <Bar dataKey="egresos" fill="#ef4444" name="Egresos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No hay datos suficientes para mostrar la gráfica
                </div>
              )}
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
                {datosCategorias.length > 0 ? (
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
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Gasto']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No hay gastos por categorías para mostrar
                  </div>
                )}
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
                {datosCategorias.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No hay categorías para mostrar
                  </div>
                )}
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
              {tendenciaMensual.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={tendenciaMensual}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Saldo']} />
                    <Area 
                      type="monotone" 
                      dataKey="saldo" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No hay datos suficientes para mostrar la tendencia
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}