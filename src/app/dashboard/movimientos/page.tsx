"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMovements } from "@/hooks/useMovements"
import { useCategories } from "@/hooks/useCategories"
import { useToast } from "@/hooks/use-toast"
import { MovementService } from "@/lib/services/movements"
import { 
  Plus, 
  Minus, 
  DollarSign, 
  Calendar, 
  FileText, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Loader2
} from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"

interface Movement {
  id: string
  amount: number
  type: 'income' | 'expense'
  description?: string
  category_id?: string
  movement_date: string
  created_at: string
}

export default function MovimientosPage() {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())

  // Form states
  const [tipo, setTipo] = useState<'income' | 'expense'>('expense')
  const [monto, setMonto] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState('all')

  // Edit states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null)
  const [editTipo, setEditTipo] = useState<'income' | 'expense'>('expense')
  const [editMonto, setEditMonto] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editFecha, setEditFecha] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const { movements, loading: movementsLoading, refetch } = useMovements(undefined, undefined, selectedYear, selectedMonth)
  const { categories, loading: categoriesLoading } = useCategories()
  const { toast } = useToast()

  // Generar opciones de años (últimos 3 años + año actual + próximo año)
  const yearOptions = []
  for (let i = currentDate.getFullYear() - 3; i <= currentDate.getFullYear() + 1; i++) {
    yearOptions.push(i)
  }

  // Nombres de meses
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const isCurrentMonth = selectedYear === currentDate.getFullYear() && selectedMonth === currentDate.getMonth()

  // Filter categories based on movement type
  const availableCategories = categories.filter(cat => cat.type === tipo)
  const editAvailableCategories = categories.filter(cat => cat.type === editTipo)

  // Filter movements
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = !searchTerm || 
      movement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories.find(c => c.id === movement.category_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || movement.type === filterType
    
    const matchesCategory = filterCategory === 'all' || 
      (filterCategory === '' && !movement.category_id) ||
      movement.category_id === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await MovementService.createMovement({
        amount: parseFloat(monto),
        type: tipo,
        description: description || undefined,
        category_id: categoryId || undefined,
        movement_date: fecha
      })

      // Reset form
      setMonto('')
      setDescription('')
      setCategoryId('')
      setFecha(new Date().toISOString().split('T')[0])
      
      await refetch()
      
      toast({
        title: "Movimiento registrado",
        description: `${tipo === 'income' ? 'Ingreso' : 'Egreso'} de $${parseFloat(monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })} registrado exitosamente.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar el movimiento. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditMovement = (movement: Movement) => {
    setEditingMovement(movement)
    setEditTipo(movement.type)
    setEditMonto(movement.amount.toString())
    setEditCategoryId(movement.category_id || '')
    setEditFecha(movement.movement_date)
    setEditDescription(movement.description || '')
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMovement) return

    setIsEditSubmitting(true)

    try {
      await MovementService.updateMovement(editingMovement.id, {
        amount: parseFloat(editMonto),
        type: editTipo,
        description: editDescription || undefined,
        category_id: editCategoryId || undefined,
        movement_date: editFecha
      })

      setIsEditDialogOpen(false)
      setEditingMovement(null)
      await refetch()
      
      toast({
        title: "Movimiento actualizado",
        description: "El movimiento ha sido actualizado exitosamente."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el movimiento. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDeleteMovement = async (id: string, description?: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar este movimiento${description ? `: "${description}"` : ''}?`)) {
      return
    }

    try {
      await MovementService.deleteMovement(id)
      await refetch()
      
      toast({
        title: "Movimiento eliminado",
        description: "El movimiento ha sido eliminado exitosamente."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el movimiento. Inténtalo de nuevo.",
        variant: "destructive"
      })
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
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Movimientos</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isCurrentMonth ? 'Gestiona tus movimientos del mes actual' : `Movimientos de ${monthNames[selectedMonth]} ${selectedYear}`}
          </p>
        </div>
        
        {/* Selector de Mes y Año */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
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
            onValueChange={(value) => setSelectedYear(parseInt(value))}
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

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Formulario de Registro */}
        <Card>
          <CardHeader>
            <CardTitle className="truncate">Registrar Movimiento</CardTitle>
            <CardDescription className="text-sm">
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
                    <TabsTrigger value="income" className="text-green-600 text-xs sm:text-sm">
                      <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="truncate">Ingreso</span>
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="text-red-600 text-xs sm:text-sm">
                      <Minus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="truncate">Egreso</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <Label htmlFor="monto">Monto</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                <Label htmlFor="categoria">Categoría (opcional)</Label>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={categoriesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      categoriesLoading 
                        ? "Cargando categorías..." 
                        : availableCategories.length === 0
                          ? `No hay categorías de ${tipo === 'income' ? 'ingresos' : 'egresos'}`
                          : "Selecciona una categoría (opcional)"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin categoría</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span className="truncate">{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <DatePicker
                  value={fecha}
                  onChange={setFecha}
                  placeholder="Seleccionar fecha"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
                    <span className="truncate">Registrando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Registrar Movimiento</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Movimientos */}
        <Card>
          <CardHeader>
            <CardTitle className="truncate">Movimientos Registrados</CardTitle>
            <CardDescription className="text-sm">
              Gestiona tus transacciones registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros y búsqueda */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Buscar movimientos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Tabs value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'income' | 'expense')} className="flex-1">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all" className="text-xs sm:text-sm truncate">Todos</TabsTrigger>
                      <TabsTrigger value="income" className="text-xs sm:text-sm truncate">Ingresos</TabsTrigger>
                      <TabsTrigger value="expense" className="text-xs sm:text-sm truncate">Egresos</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="">Sin categoría</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="truncate">{category.icon} {category.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {movementsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin flex-shrink-0" />
                <span className="ml-2">Cargando movimientos...</span>
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                {searchTerm || filterType !== 'all' || filterCategory !== 'all' ? (
                  <>
                    <p>No se encontraron movimientos</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </>
                ) : (
                  <>
                    <p>No hay movimientos registrados</p>
                    <p className="text-sm">Registra tu primer movimiento usando el formulario</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredMovements.map((movement) => {
                  const category = categories.find(c => c.id === movement.category_id)
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg min-w-0">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
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
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {movement.description || 'Sin descripción'}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                            <Badge variant="secondary" className="text-xs w-fit">
                              <span className="truncate">{category ? `${category.icon} ${category.name}` : '🏷️ Sin categoría'}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(movement.movement_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`font-bold text-sm sm:text-base ${
                          movement.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatAmount(movement.amount, movement.type)}
                        </span>
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditMovement(movement)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteMovement(movement.id, movement.description)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para editar movimiento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Movimiento</DialogTitle>
            <DialogDescription>
              Modifica los detalles del movimiento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Tipo de Movimiento */}
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Tabs value={editTipo} onValueChange={(value) => {
                setEditTipo(value as 'income' | 'expense')
                setEditCategoryId('') // Reset category when type changes
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
              <Label htmlFor="edit-monto">Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-monto"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  value={editMonto}
                  onChange={(e) => setEditMonto(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="edit-categoria">Categoría (opcional)</Label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría</SelectItem>
                  {editAvailableCategories.map((category) => (
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
              <Label htmlFor="edit-fecha">Fecha</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-fecha"
                  type="date"
                  className="pl-10"
                  value={editFecha}
                  onChange={(e) => setEditFecha(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción (opcional)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-description"
                  placeholder="Descripción del movimiento..."
                  className="pl-10"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
                disabled={isEditSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isEditSubmitting}
              >
                {isEditSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}