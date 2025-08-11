"use client"

// React hooks
import { useState, useMemo, useCallback } from "react"

// UI Components
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Loading components
import { MovementsSkeleton } from "@/components/loading/movements-skeleton"

// Custom hooks
import { useCategories } from "@/hooks/useCategories"
import { useMovements } from "@/hooks/useMovements"

// Providers
import { useActiveFinancialContext } from "@/providers/financial-context-provider"

// Utilities
import { formatAmount, formatDate } from "@/lib/formatters"
import { useStandardToast } from "@/lib/toast-utils"
import { getCurrentBogotaDate, dateInputToUTC, dateUTCToBogota } from "@/lib/utils"
import { isPositiveNumber, VALIDATION_MESSAGES } from "@/lib/validation-utils"

// Icons
import {
  Calendar,
  DollarSign,
  Edit,
  FileText,
  Filter,
  Loader2,
  Minus,
  Plus,
  Search,
  Trash2,
  User,
  Users
} from "lucide-react"

// Types
import type { Movement } from '@/lib/types'

export default function MovimientosPage() {
  const { activeContext, loading: contextLoading } = useActiveFinancialContext()
  const currentDate = useMemo(() => new Date(), [])
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())

  // Form states
  const [movementType, setMovementType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [movementDate, setMovementDate] = useState(getCurrentBogotaDate())
  const [movementDescription, setMovementDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState('all')

  // Edit states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null)
  const [editMovementType, setEditMovementType] = useState<'income' | 'expense'>('expense')
  const [editAmount, setEditAmount] = useState('')
  const [editSelectedCategoryId, setEditSelectedCategoryId] = useState('')
  const [editMovementDate, setEditMovementDate] = useState('')
  const [editMovementDescription, setEditMovementDescription] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const { 
    movements, 
    loading: movementsLoading, 
    createMovementAsync,
    updateMovement, 
    deleteMovement 
  } = useMovements(activeContext?.id, undefined, selectedYear, selectedMonth)
  const { categories, loading: categoriesLoading } = useCategories(activeContext?.id)
  const { showError, showOperationSuccess, showOperationError } = useStandardToast()

  // Generar opciones de años (memoizado)
  const yearOptions = useMemo(() => {
    const options = []
    for (let i = currentDate.getFullYear() - 3; i <= currentDate.getFullYear() + 1; i++) {
      options.push(i)
    }
    return options
  }, [currentDate])

  // Nombres de meses (memoizado)
  const monthNames = useMemo(() => [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ], [])

  // Verificar si es el mes actual (memoizado)
  const isCurrentMonth = useMemo(() => 
    selectedYear === currentDate.getFullYear() && selectedMonth === currentDate.getMonth(),
    [selectedYear, selectedMonth, currentDate]
  )

  // Filter categories based on movement type (memoizado)
  const availableCategories = useMemo(() => 
    categories.filter(cat => cat.type === movementType),
    [categories, movementType]
  )
  
  const editAvailableCategories = useMemo(() => 
    categories.filter(cat => cat.type === editMovementType),
    [categories, editMovementType]
  )

  // Filter movements (memoizado)
  const filteredMovements = useMemo(() => {
    return movements.filter(movement => {
      const matchesSearch = !searchTerm || 
        movement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categories.find(c => c.id === movement.category_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === 'all' || movement.type === filterType
      
      const matchesCategory = filterCategory === 'all' || 
        (filterCategory === '' && !movement.category_id) ||
        movement.category_id === filterCategory

      return matchesSearch && matchesType && matchesCategory
    })
  }, [movements, searchTerm, filterType, filterCategory, categories])

  // Función para validar los datos del formulario (memoizada)
  const validateMovementForm = useCallback((): string | null => {
    if (!isPositiveNumber(amount)) {
      return VALIDATION_MESSAGES.POSITIVE_NUMBER
    }

    if (!movementDate) {
      return "Por favor selecciona una fecha"
    }

    return null
  }, [amount, movementDate])

  // Función para resetear el formulario (memoizada)
  const resetMovementForm = useCallback(() => {
    setAmount('')
    setMovementDescription('')
    setSelectedCategoryId('')
    setMovementDate(getCurrentBogotaDate())
  }, [])

  // Función para crear el movimiento (memoizada)
  const createMovement = useCallback(async () => {
    await createMovementAsync({
      amount: parseFloat(amount),
      type: movementType,
      description: movementDescription || undefined,
      category_id: selectedCategoryId || undefined,
      movement_date: dateInputToUTC(movementDate), // Convertir a UTC
      context_id: activeContext?.id
    })
  }, [amount, movementType, movementDescription, selectedCategoryId, movementDate, activeContext?.id, createMovementAsync])

  // Show loading state if context is loading
  if (contextLoading || movementsLoading || categoriesLoading) {
    return <MovementsSkeleton />
  }

  // Show message if no active context
  if (!activeContext) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No hay contexto financiero activo</h2>
          <p className="text-muted-foreground">
            Selecciona un contexto financiero en la configuración para gestionar tus movimientos.
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateMovementForm()
    if (validationError) {
      showError(validationError, "Error de validación")
      return
    }

    setIsSubmitting(true)

    try {
      await createMovement()
      resetMovementForm()
      
      showOperationSuccess("crear", "Movimiento")
    } catch (error) {
      showOperationError("crear", "movimiento", error instanceof Error ? error.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditMovement = (movement: Movement) => {
    setEditingMovement(movement)
    setEditMovementType(movement.type)
    setEditAmount(movement.amount.toString())
    setEditSelectedCategoryId(movement.category_id || '')
    setEditMovementDate(dateUTCToBogota(movement.movement_date)) // Convertir de UTC a Bogotá
    setEditMovementDescription(movement.description || '')
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMovement) return

    setIsEditSubmitting(true)

    try {
      updateMovement({
        id: editingMovement.id,
        updates: {
          amount: parseFloat(editAmount),
          type: editMovementType,
          description: editMovementDescription || undefined,
          category_id: editSelectedCategoryId || undefined,
          movement_date: dateInputToUTC(editMovementDate), // Convertir a UTC
          context_id: activeContext?.id
        }
      })

      setIsEditDialogOpen(false)
      setEditingMovement(null)
      
      showOperationSuccess("actualizar", "Movimiento")
    } catch (error) {
      showOperationError("actualizar", "movimiento", error instanceof Error ? error.message : undefined)
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDeleteMovement = async (id: string, description?: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar este movimiento${description ? `: "${description}"` : ''}?`)) {
      return
    }

    try {
      deleteMovement(id)
      
      showOperationSuccess("eliminar", "Movimiento")
    } catch (error) {
      showOperationError("eliminar", "movimiento", error instanceof Error ? error.message : undefined)
    }
  }

  // Función de formateo movida a @/lib/formatters

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Movimientos</h1>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base truncate">
              {isCurrentMonth ? 'Gestiona tus movimientos del mes actual' : `Movimientos de ${monthNames[selectedMonth]} ${selectedYear}`} - {activeContext.name}
            </p>
          </div>
        </div>
        
        {/* Selector de Mes y Año */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-24 sm:w-28 lg:w-36">
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
            <SelectTrigger className="w-20 sm:w-24 lg:w-28">
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
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl truncate">Registrar Movimiento</CardTitle>
            <CardDescription className="text-sm">
              Añade un nuevo ingreso o egreso a tu registro financiero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de Movimiento */}
              <div className="space-y-2">
                <Label>Tipo de Movimiento</Label>
                <Tabs value={movementType} onValueChange={(value) => {
                  setMovementType(value as 'income' | 'expense')
                  setSelectedCategoryId('') // Reset category when type changes
                }}>
                  <TabsList className="grid w-full grid-cols-2 h-10">
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
                <Label htmlFor="amount">Monto</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10 text-sm sm:text-base"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría (opcional)</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={categoriesLoading}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder={
                      categoriesLoading 
                        ? "Cargando categorías..." 
                        : availableCategories.length === 0
                          ? `No hay categorías de ${movementType === 'income' ? 'ingresos' : 'egresos'}`
                          : "Selecciona una categoría (opcional)"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin categoría</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <span className="text-base sm:text-lg">{category.icon}</span>
                          <span className="text-sm sm:text-base truncate">{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="movementDate">Fecha</Label>
                <Input
                  id="movementDate"
                  type="date"
                  value={movementDate}
                  onChange={(e) => setMovementDate(e.target.value)}
                  className="text-sm sm:text-base"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="movementDescription">Descripción (opcional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="movementDescription"
                    placeholder="Descripción del movimiento..."
                    className="pl-10 text-sm sm:text-base"
                    value={movementDescription}
                    onChange={(e) => setMovementDescription(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-10 sm:h-11" disabled={isSubmitting || categoriesLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">Registrando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">Registrar Movimiento</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Movimientos */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl truncate">Movimientos Registrados</CardTitle>
            <CardDescription className="text-sm">
              Gestiona tus transacciones registradas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros y búsqueda */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Buscar movimientos..."
                  className="pl-10 text-sm sm:text-base"
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
                <span className="ml-2 text-sm sm:text-base">Cargando movimientos...</span>
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                {searchTerm || filterType !== 'all' || filterCategory !== 'all' ? (
                  <>
                    <p className="text-sm sm:text-base">No se encontraron movimientos</p>
                    <p className="text-xs sm:text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm sm:text-base">No hay movimientos registrados</p>
                    <p className="text-xs sm:text-sm">Registra tu primer movimiento usando el formulario</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-4 max-h-[60vh] sm:max-h-96 overflow-y-auto overscroll-contain">
                {filteredMovements.map((movement) => {
                  const category = categories.find(c => c.id === movement.category_id)
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg min-w-0">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                          movement.type === 'income' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20' 
                            : 'bg-red-100 text-red-600 dark:bg-red-900/20'
                        }`}>
                          {movement.type === 'income' ? (
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-sm sm:text-base">
                            {movement.description || 'Sin descripción'}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                            <Badge variant="secondary" className="text-xs w-fit">
                              <span className="truncate">{category ? `${category.icon} ${category.name}` : '🏷️ Sin categoría'}</span>
                            </Badge>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {formatDate(movement.movement_date)}
                            </div>
                          </div>
                          {/* Información de auditoría */}
                          <div className="flex items-center space-x-1 mt-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {movement.created_by_profile?.name || 'Usuario desconocido'}
                            </span>
                            {movement.updated_by && movement.updated_by !== movement.created_by && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Editado por {movement.updated_by_profile?.name || 'Usuario desconocido'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <span className={`font-bold text-xs sm:text-sm lg:text-base ${
                          movement.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatAmount(movement.amount, movement.type)}
                        </span>
                        <div className="flex space-x-0.5 sm:space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditMovement(movement)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteMovement(movement.id, movement.description)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
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
            {/* Información de auditoría en el diálogo */}
            {editingMovement && (
              <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Creado por: <span className="font-medium">{editingMovement.created_by_profile?.name || 'Usuario desconocido'}</span>
                  </span>
                </div>
                {editingMovement.updated_by && editingMovement.updated_by !== editingMovement.created_by && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Última modificación: <span className="font-medium">{editingMovement.updated_by_profile?.name || 'Usuario desconocido'}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Tipo de Movimiento */}
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Tabs value={editMovementType} onValueChange={(value) => {
                const newType = value as 'income' | 'expense'
                setEditMovementType(newType)
                
                // Only reset category if current category is not compatible with new type
                if (editSelectedCategoryId) {
                  const currentCategory = categories.find(cat => cat.id === editSelectedCategoryId)
                  if (currentCategory && currentCategory.type !== newType) {
                    setEditSelectedCategoryId('')
                  }
                }
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
              <Label htmlFor="edit-amount">Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="edit-categoria">Categoría (opcional)</Label>
              <Select value={editSelectedCategoryId} onValueChange={setEditSelectedCategoryId}>
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
              <Label htmlFor="edit-movementDate">Fecha</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-movementDate"
                  type="date"
                  className="pl-10"
                  value={editMovementDate}
                  onChange={(e) => setEditMovementDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="edit-movementDescription">Descripción (opcional)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-movementDescription"
                  placeholder="Descripción del movimiento..."
                  className="pl-10"
                  value={editMovementDescription}
                  onChange={(e) => setEditMovementDescription(e.target.value)}
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