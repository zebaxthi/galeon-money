"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  TrendingUp,
  TrendingDown
} from "lucide-react"

export default function CategoriasPage() {
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [tipoCategoria, setTipoCategoria] = useState<'ingreso' | 'egreso'>('egreso')
  const [colorCategoria, setColorCategoria] = useState('#8b5cf6')

  const categorias = [
    { id: 1, nombre: 'Alimentación', tipo: 'egreso', color: '#ef4444', movimientos: 15 },
    { id: 2, nombre: 'Transporte', tipo: 'egreso', color: '#f97316', movimientos: 8 },
    { id: 3, nombre: 'Salario', tipo: 'ingreso', color: '#22c55e', movimientos: 2 },
    { id: 4, nombre: 'Entretenimiento', tipo: 'egreso', color: '#a855f7', movimientos: 5 },
    { id: 5, nombre: 'Servicios', tipo: 'egreso', color: '#3b82f6', movimientos: 12 },
    { id: 6, nombre: 'Freelance', tipo: 'ingreso', color: '#10b981', movimientos: 3 },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar guardado en Supabase
    console.log({ nombreCategoria, tipoCategoria, colorCategoria })
    setNombreCategoria('')
  }

  const coloresDisponibles = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categorías</h1>
        <p className="text-muted-foreground">
          Organiza tus movimientos con categorías personalizadas
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario para Nueva Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Nueva Categoría</CardTitle>
            <CardDescription>
              Crea una nueva categoría para organizar tus movimientos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Categoría</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nombre"
                    placeholder="Ej: Alimentación"
                    className="pl-10"
                    value={nombreCategoria}
                    onChange={(e) => setNombreCategoria(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Tabs value={tipoCategoria} onValueChange={(value) => setTipoCategoria(value as 'ingreso' | 'egreso')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ingreso" className="text-green-600">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Ingreso
                    </TabsTrigger>
                    <TabsTrigger value="egreso" className="text-red-600">
                      <TrendingDown className="mr-2 h-4 w-4" />
                      Egreso
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-8 gap-2">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        colorCategoria === color ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setColorCategoria(color)}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Crear Categoría
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Categorías */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Categorías Existentes</CardTitle>
              <CardDescription>
                Gestiona tus categorías de ingresos y egresos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorias.map((categoria) => (
                  <div key={categoria.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: categoria.color }}
                      />
                      <div>
                        <p className="font-medium">{categoria.nombre}</p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={categoria.tipo === 'ingreso' ? 'default' : 'secondary'}
                            className={categoria.tipo === 'ingreso' ? 'bg-green-600' : 'bg-red-600'}
                          >
                            {categoria.tipo === 'ingreso' ? (
                              <TrendingUp className="mr-1 h-3 w-3" />
                            ) : (
                              <TrendingDown className="mr-1 h-3 w-3" />
                            )}
                            {categoria.tipo}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {categoria.movimientos} movimientos
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}