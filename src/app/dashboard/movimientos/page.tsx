"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMovements } from "@/hooks/useMovements"
import { useCategories } from "@/hooks/useCategories"
import { 
  Plus, 
  Minus, 
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Loader2
} from "lucide-react"

export default function MovimientosPage() {
  const [tipo, setTipo] = useState<'income' | 'expense'>('expense')
  const [monto, setMonto] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()
  const { movements, loading: movementsLoading, createMovement } = useMovements(undefined, 10)
  const { categories, loading: categoriesLoading, getCategoriesByType } = useCategories()

  const availableCategories = getCategoriesByType(tipo)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!monto || !categoryId || !fecha) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await createMovement({
        amount: parseFloat(monto),
        type: tipo,
        category_id: categoryId,
        movement_date: fecha,
        description: description || undefined
      })

      // Limpiar formulario
      setMonto('')
      setCategoryId('')
      setDescription('')
      setFecha(new Date().toISOString().split('T')[0])

      toast({
        title: "¡Éxito!",
        description: "Movimiento registrado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el movimiento. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const prefix = type === 'income' ? '+' : '-'
    return `${prefix}$${amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
                <Tabs value={tipo} onValueChange={(value) => {
                  setTipo(value as 'income' | 'expense')
                  setCategoryId('') // Reset category when type changes
                }}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="income" className="text-green-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Ingreso
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="text-red-600">
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
                <Select value={categoryId} onValueChange={setCategoryId} disabled={categoriesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      categoriesLoading 
                        ? "Cargando categorías..." 
                        : availableCategories.length === 0
                          ? `No hay categorías de ${tipo === 'income' ? 'ingresos' : 'egresos'}`
                          : "Selecciona una categoría"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="description"
                    placeholder="Descripción del movimiento..."
                    className="pl-10"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || categoriesLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Movimiento
                  </>
                )}
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
            {movementsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Cargando movimientos...</span>
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay movimientos registrados</p>
                <p className="text-sm">Registra tu primer movimiento usando el formulario</p>
              </div>
            ) : (
              <div className="space-y-4">
                {movements.map((movement) => {
                  const category = categories.find(c => c.id === movement.category_id)
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          movement.type === 'income' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20' 
                            : 'bg-red-100 text-red-600 dark:bg-red-900/20'
                        }`}>
                          {movement.type === 'income' ? (
                            <Plus className="h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
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
                      <span className={`font-bold ${
                        movement.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatAmount(movement.amount, movement.type)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}