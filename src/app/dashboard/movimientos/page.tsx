"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Minus, 
  Calendar,
  DollarSign,
  Tag,
  FileText
} from "lucide-react"

export default function MovimientosPage() {
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('egreso')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [notas, setNotas] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar guardado en Supabase
    console.log({ tipo, monto, categoria, fecha, notas })
  }

  const movimientosRecientes = [
    { id: 1, tipo: 'egreso', monto: 45.50, categoria: 'Alimentación', descripcion: 'Supermercado', fecha: '2024-01-15' },
    { id: 2, tipo: 'ingreso', monto: 2500.00, categoria: 'Trabajo', descripcion: 'Salario', fecha: '2024-01-15' },
    { id: 3, tipo: 'egreso', monto: 60.00, categoria: 'Transporte', descripcion: 'Gasolina', fecha: '2024-01-14' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Movimientos</h1>
        <p className="text-muted-foreground">
          Registra tus ingresos y egresos
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario de Registro */}
        <Card>
          <CardHeader>
            <CardTitle>Registrar Movimiento</CardTitle>
            <CardDescription>
              Añade un nuevo ingreso o egreso a tu registro financiero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de Movimiento */}
              <div className="space-y-2">
                <Label>Tipo de Movimiento</Label>
                <Tabs value={tipo} onValueChange={(value) => setTipo(value as 'ingreso' | 'egreso')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ingreso" className="text-green-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Ingreso
                    </TabsTrigger>
                    <TabsTrigger value="egreso" className="text-red-600">
                      <Minus className="mr-2 h-4 w-4" />
                      Egreso
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <Label htmlFor="monto">Monto</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="categoria"
                    placeholder="Ej: Alimentación, Transporte, Salario"
                    className="pl-10"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fecha"
                    type="date"
                    className="pl-10"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notas">Notas (opcional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="notas"
                    placeholder="Descripción adicional..."
                    className="pl-10"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Registrar Movimiento
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Movimientos Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
            <CardDescription>
              Tus últimas transacciones registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movimientosRecientes.map((movimiento) => (
                <div key={movimiento.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      movimiento.tipo === 'ingreso' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900/20'
                    }`}>
                      {movimiento.tipo === 'ingreso' ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{movimiento.descripcion}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {movimiento.categoria}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {movimiento.fecha}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movimiento.tipo === 'ingreso' ? '+' : '-'}${movimiento.monto.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}