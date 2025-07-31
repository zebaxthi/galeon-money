"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/hooks/useCategories"
import { 
  Plus, 
  Trash2, 
  Tag,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react"

export default function CategoriasPage() {
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [tipoCategoria, setTipoCategoria] = useState<'income' | 'expense'>('expense')
  const [iconoCategoria, setIconoCategoria] = useState('🏷️')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()
  const { 
    categories, 
    loading, 
    createCategory, 
    deleteCategory,
    getCategoriesByType 
  } = useCategories()

  const ingresos = getCategoriesByType('income')
  const egresos = getCategoriesByType('expense')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nombreCategoria.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la categoría",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await createCategory({
        name: nombreCategoria.trim(),
        type: tipoCategoria,
        icon: iconoCategoria
      })

      // Limpiar formulario
      setNombreCategoria('')
      setIconoCategoria('🏷️')

      toast({
        title: "¡Éxito!",
        description: "Categoría creada correctamente",
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${name}"?`)) {
      return
    }

    try {
      await deleteCategory(id)
      toast({
        title: "Categoría eliminada",
        description: `La categoría "${name}" ha sido eliminada correctamente`,
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría. Puede que tenga movimientos asociados.",
        variant: "destructive"
      })
    }
  }

  const iconosDisponibles = [
    '🏷️', '🍔', '🚗', '🏠', '💡', '🎮', '👕', '💊', 
    '📚', '🎬', '✈️', '🏋️', '💰', '💼', '🎯', '🛒'
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
                <Tabs value={tipoCategoria} onValueChange={(value) => setTipoCategoria(value as 'income' | 'expense')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="income" className="text-green-600">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Ingreso
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="text-red-600">
                      <TrendingDown className="mr-2 h-4 w-4" />
                      Egreso
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label>Icono</Label>
                <div className="grid grid-cols-8 gap-2">
                  {iconosDisponibles.map((icono) => (
                    <button
                      key={icono}
                      type="button"
                      className={`w-8 h-8 rounded border-2 flex items-center justify-center text-lg ${
                        iconoCategoria === icono 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setIconoCategoria(icono)}
                    >
                      {icono}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Categoría
                  </>
                )}
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando categorías...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay categorías registradas</p>
                  <p className="text-sm">Crea tu primera categoría usando el formulario</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Categorías de Ingresos */}
                  {ingresos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-green-600 mb-3 flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Ingresos ({ingresos.length})
                      </h3>
                      <div className="space-y-2">
                        {ingresos.map((categoria) => (
                          <div key={categoria.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{categoria.icon}</span>
                              <div>
                                <p className="font-medium">{categoria.name}</p>
                                <Badge variant="default" className="bg-green-600">
                                  <TrendingUp className="mr-1 h-3 w-3" />
                                  Ingreso
                                </Badge>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteCategory(categoria.id, categoria.name)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categorías de Egresos */}
                  {egresos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-red-600 mb-3 flex items-center">
                        <TrendingDown className="mr-2 h-4 w-4" />
                        Egresos ({egresos.length})
                      </h3>
                      <div className="space-y-2">
                        {egresos.map((categoria) => (
                          <div key={categoria.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{categoria.icon}</span>
                              <div>
                                <p className="font-medium">{categoria.name}</p>
                                <Badge variant="secondary" className="bg-red-600 text-white">
                                  <TrendingDown className="mr-1 h-3 w-3" />
                                  Egreso
                                </Badge>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteCategory(categoria.id, categoria.name)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}