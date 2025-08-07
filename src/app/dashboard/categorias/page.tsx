'use client'

import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { useActiveFinancialContext } from '@/providers/financial-context-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { useToast } from '@/hooks/use-toast'
import { 
  Tag, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Loader2, 
  Trash2,
  Search,
  Filter,
  Wallet
} from 'lucide-react'
import Link from "next/link"

export default function CategoriasPage() {
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [tipoCategoria, setTipoCategoria] = useState<'income' | 'expense'>('expense')
  const [iconoCategoria, setIconoCategoria] = useState('🏷️')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

  const { activeContext, isLoading: contextLoading } = useActiveFinancialContext()
  const { 
    categories, 
    loading, 
    createCategory, 
    deleteCategory,
    getCategoriesByType 
  } = useCategories(activeContext?.id)
  
  const { toast } = useToast()

  // Mostrar loading si el contexto está cargando
  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando contexto financiero...</p>
        </div>
      </div>
    )
  }

  // Mostrar mensaje si no hay contexto activo
  if (!activeContext) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No hay contexto financiero activo</h2>
          <p className="text-muted-foreground mb-4">
            Necesitas crear o seleccionar un contexto financiero para gestionar categorías.
          </p>
          <Button asChild>
            <Link href="/dashboard/ajustes">
              Ir a Configuración
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Filtrar categorías por búsqueda y tipo
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || category.type === filterType
    return matchesSearch && matchesType
  })

  const filteredIngresos = filteredCategories.filter(cat => cat.type === 'income')
  const filteredEgresos = filteredCategories.filter(cat => cat.type === 'expense')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones del frontend
    const trimmedName = nombreCategoria.trim()
    
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la categoría",
        variant: "destructive"
      })
      return
    }

    if (trimmedName.length < 2) {
      toast({
        title: "Error",
        description: "El nombre debe tener al menos 2 caracteres",
        variant: "destructive"
      })
      return
    }

    if (trimmedName.length > 50) {
      toast({
        title: "Error",
        description: "El nombre no puede exceder 50 caracteres",
        variant: "destructive"
      })
      return
    }

    // Verificar duplicados en el frontend (validación adicional)
    const existingCategories = getCategoriesByType(tipoCategoria)
    const isDuplicate = existingCategories.some(
      cat => cat.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (isDuplicate) {
      toast({
        title: "Error",
        description: `Ya existe una categoría de ${tipoCategoria === 'income' ? 'ingresos' : 'egresos'} con el nombre "${trimmedName}"`,
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await createCategory({
        name: trimmedName,
        type: tipoCategoria,
        icon: iconoCategoria,
        color: tipoCategoria === 'income' ? '#10b981' : '#ef4444',
        context_id: activeContext.id
      })

      // Limpiar formulario
      setNombreCategoria('')
      setIconoCategoria('🏷️')

      toast({
        title: "¡Éxito!",
        description: "Categoría creada correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la categoría. Inténtalo de nuevo.",
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
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la categoría. Puede que tenga movimientos asociados.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categorías</h1>
        <p className="text-muted-foreground">
          Organiza tus movimientos con categorías personalizadas - {activeContext.name}
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
                    maxLength={50}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {nombreCategoria.length}/50 caracteres
                </p>
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
                <EmojiPicker
                  value={iconoCategoria}
                  onChange={setIconoCategoria}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
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
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Tabs value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'income' | 'expense')}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="income">Ingresos</TabsTrigger>
                  <TabsTrigger value="expense">Egresos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando categorías...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Categorías de Ingresos */}
              {(filterType === 'all' || filterType === 'income') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Categorías de Ingresos ({filteredIngresos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredIngresos.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No hay categorías de ingresos
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {filteredIngresos.map((categoria) => (
                          <div
                            key={categoria.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{categoria.icon}</span>
                              <div>
                                <p className="font-medium">{categoria.name}</p>
                                <Badge variant="secondary" className="text-xs">
                                  Ingreso
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(categoria.id, categoria.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Categorías de Egresos */}
              {(filterType === 'all' || filterType === 'expense') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-600">
                      <TrendingDown className="mr-2 h-5 w-5" />
                      Categorías de Egresos ({filteredEgresos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredEgresos.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No hay categorías de egresos
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {filteredEgresos.map((categoria) => (
                          <div
                            key={categoria.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{categoria.icon}</span>
                              <div>
                                <p className="font-medium">{categoria.name}</p>
                                <Badge variant="secondary" className="text-xs">
                                  Egreso
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(categoria.id, categoria.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}