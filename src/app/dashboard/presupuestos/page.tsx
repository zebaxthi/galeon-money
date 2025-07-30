"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Target, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2
} from "lucide-react"

export default function PresupuestosPage() {
  const [nombrePresupuesto, setNombrePresupuesto] = useState('')
  const [montoPresupuesto, setMontoPresupuesto] = useState('')
  const [categoriaPresupuesto, setCategoriaPresupuesto] = useState('')
  const [periodoPresupuesto, setPeriodoPresupuesto] = useState('mensual')

  const presupuestos = [
    { 
      id: 1, 
      nombre: 'Alimentación', 
      categoria: 'Alimentación',
      limite: 500, 
      gastado: 320, 
      periodo: 'mensual',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31'
    },
    { 
      id: 2, 
      nombre: 'Transporte', 
      categoria: 'Transporte',
      limite: 200, 
      gastado: 180, 
      periodo: 'mensual',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31'
    },
    { 
      id: 3, 
      nombre: 'Entretenimiento', 
      categoria: 'Entretenimiento',
      limite: 150, 
      gastado: 175, 
      periodo: 'mensual',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31'
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar guardado en Supabase
    console.log({ nombrePresupuesto, montoPresupuesto, categoriaPresupuesto, periodoPresupuesto })
    setNombrePresupuesto('')
    setMontoPresupuesto('')
    setCategoriaPresupuesto('')
  }

  const getProgressColor = (gastado: number, limite: number) => {
    const porcentaje = (gastado / limite) * 100
    if (porcentaje >= 100) return 'bg-red-500'
    if (porcentaje >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusIcon = (gastado: number, limite: number) => {
    const porcentaje = (gastado / limite) * 100
    if (porcentaje >= 100) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (porcentaje >= 80) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Presupuestos</h1>
        <p className="text-muted-foreground">
          Controla tus gastos con presupuestos personalizados
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario para Nuevo Presupuesto */}
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Presupuesto</CardTitle>
            <CardDescription>
              Crea un presupuesto para controlar tus gastos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Presupuesto</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nombre"
                    placeholder="Ej: Alimentación Enero"
                    className="pl-10"
                    value={nombrePresupuesto}
                    onChange={(e) => setNombrePresupuesto(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  placeholder="Seleccionar categoría"
                  value={categoriaPresupuesto}
                  onChange={(e) => setCategoriaPresupuesto(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Límite de Gasto</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={montoPresupuesto}
                    onChange={(e) => setMontoPresupuesto(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodo">Período</Label>
                <select 
                  id="periodo"
                  className="w-full p-2 border rounded-md"
                  value={periodoPresupuesto}
                  onChange={(e) => setPeriodoPresupuesto(e.target.value)}
                >
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Crear Presupuesto
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Presupuestos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Presupuestos Activos</CardTitle>
              <CardDescription>
                Seguimiento de tus presupuestos actuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {presupuestos.map((presupuesto) => {
                  const porcentaje = (presupuesto.gastado / presupuesto.limite) * 100
                  const restante = presupuesto.limite - presupuesto.gastado
                  
                  return (
                    <div key={presupuesto.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(presupuesto.gastado, presupuesto.limite)}
                          <h3 className="font-semibold">{presupuesto.nombre}</h3>
                          <Badge variant="secondary">{presupuesto.categoria}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Gastado: ${presupuesto.gastado.toLocaleString()}</span>
                          <span>Límite: ${presupuesto.limite.toLocaleString()}</span>
                        </div>
                        
                        <Progress 
                          value={Math.min(porcentaje, 100)} 
                          className="h-2"
                        />
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{porcentaje.toFixed(1)}% utilizado</span>
                          <span className={restante >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {restante >= 0 ? `$${restante.toLocaleString()} restante` : `$${Math.abs(restante).toLocaleString()} excedido`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}