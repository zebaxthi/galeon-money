'use client'

// React hooks
import { useState, useEffect } from 'react'

// Next.js components
import Link from "next/link"

// UI Components
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Custom hooks
import { useBudgets, useBudgetProgress } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'

// Providers
import { useActiveFinancialContext } from '@/providers/financial-context-provider'

// Utilities
import { formatCurrency, formatDate } from '@/lib/formatters'
import { useStandardToast } from "@/lib/toast-utils"
import { getCurrentBogotaDate, dateInputToUTC, dateUTCToBogota } from '@/lib/utils'
import { isNotEmpty, isPositiveNumber, isEndDateAfterStartDate, VALIDATION_MESSAGES } from '@/lib/validation-utils'

// Icons
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Edit,
  Filter,
  Loader2,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Wallet
} from 'lucide-react'

// Types
import type { Budget } from '@/lib/types'

export default function PresupuestosPage() {
  // Todos los hooks deben ir al principio, antes de cualquier return
  const [budgetName, setBudgetName] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [budgetCategoryId, setBudgetCategoryId] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState('monthly')
  const [startDate, setStartDate] = useState(getCurrentBogotaDate())
  const [endDate, setEndDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'exceeded' | 'completed'>('all')
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { activeContext, loading: contextLoading } = useActiveFinancialContext()
  const { budgets, loading, createBudget, updateBudget, deleteBudget, isUpdating } = useBudgets(activeContext?.id)
  const { budgetProgress, loading: progressLoading } = useBudgetProgress(activeContext?.id)
  const { categories, getCategoriesByType } = useCategories(activeContext?.id)
  const { showError, showOperationSuccess, showOperationError } = useStandardToast()

  // Calcular fecha de fin automática
  const calculateEndDate = (startDate: string, period: string) => {
    const start = new Date(startDate)
    const end = new Date(start)
    
    switch (period) {
      case 'weekly':
        end.setDate(start.getDate() + 6)
        break
      case 'monthly':
        end.setMonth(start.getMonth() + 1)
        end.setDate(start.getDate() - 1)
        break
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1)
        end.setDate(start.getDate() - 1)
        break
    }
    
    return end.toISOString().split('T')[0]
  }

  // useEffect debe ir después de todos los otros hooks pero antes de los returns
  useEffect(() => {
    if (startDate) {
      const newEndDate = calculateEndDate(startDate, budgetPeriod)
      setEndDate(newEndDate)
    }
  }, [startDate, budgetPeriod])

  const expenseCategories = getCategoriesByType('expense')

  // Ahora sí pueden ir los returns condicionales
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

  if (!activeContext) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No hay contexto financiero activo</h2>
          <p className="text-muted-foreground mb-4">
            Necesitas crear o seleccionar un contexto financiero para gestionar presupuestos.
          </p>
          <Button asChild>
            <Link href="/ajustes">
              Ir a Configuración
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Filtrar presupuestos
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         categories.find(c => c.id === budget.category_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    if (filterStatus === 'all') return true

    const progress = budgetProgress?.find(p => p.id === budget.id)
    if (!progress) return filterStatus === 'active'

    const percentage = (progress.spent / budget.amount) * 100

    switch (filterStatus) {
      case 'active':
        return percentage < 100
      case 'exceeded':
        return percentage > 100
      case 'completed':
        return percentage >= 90 && percentage <= 100
      default:
        return true
    }
  })

  const handlePeriodChange = (period: string) => {
    setBudgetPeriod(period)
  }

  const handleStartDateChange = (date: string) => {
    setStartDate(date)
  }

  // Función para validar los datos del presupuesto
  const validateBudgetForm = (): { isValid: boolean; error?: string; trimmedName?: string } => {
    const trimmedName = budgetName.trim()
    
    if (!isNotEmpty(budgetName)) {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED }
    }

    if (trimmedName.length < 2) {
      return { isValid: false, error: VALIDATION_MESSAGES.MIN_LENGTH(2) }
    }

    if (trimmedName.length > 100) {
      return { isValid: false, error: "El nombre no puede exceder 100 caracteres" }
    }

    if (!isPositiveNumber(budgetAmount)) {
      return { isValid: false, error: VALIDATION_MESSAGES.POSITIVE_NUMBER }
    }

    if (!budgetCategoryId) {
      return { isValid: false, error: "Por favor selecciona una categoría" }
    }

    if (!startDate || !endDate) {
      return { isValid: false, error: "Por favor selecciona las fechas del presupuesto" }
    }

    if (!isEndDateAfterStartDate(startDate, endDate)) {
      return { isValid: false, error: VALIDATION_MESSAGES.END_AFTER_START }
    }

    return { isValid: true, trimmedName }
  }

  // Función para resetear el formulario de presupuesto
  const resetBudgetForm = () => {
    setBudgetName('')
    setBudgetAmount('')
    setBudgetCategoryId('')
    setBudgetPeriod('monthly')
    setStartDate(getCurrentBogotaDate())
    setEndDate('')
  }

  // Función para crear el presupuesto
  const createBudgetWithData = async (trimmedName: string) => {
    await createBudget({
      name: trimmedName,
      amount: parseFloat(budgetAmount),
      category_id: budgetCategoryId,
      period: budgetPeriod as 'weekly' | 'monthly' | 'yearly',
      start_date: dateInputToUTC(startDate), // Convertir a UTC
      end_date: dateInputToUTC(endDate), // Convertir a UTC
      context_id: activeContext?.id
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateBudgetForm()
    if (!validation.isValid) {
      showError(validation.error!, "Error de validación")
      return
    }

    setIsSubmitting(true)
    
    try {
      await createBudgetWithData(validation.trimmedName!)
      resetBudgetForm()
      
      showOperationSuccess("crear", "Presupuesto")
    } catch (error) {
      showOperationError("crear", "presupuesto", error instanceof Error ? error.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBudget = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el presupuesto "${name}"?`)) {
      return
    }

    try {
      await deleteBudget(id)
      showOperationSuccess("eliminar", "Presupuesto")
    } catch (error) {
      showOperationError("eliminar", "presupuesto", error instanceof Error ? error.message : undefined)
    }
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setIsEditModalOpen(true)
  }

  const handleUpdateBudget = async (budgetData: { name: string; amount: number; category_id: string; period: 'weekly' | 'monthly' | 'yearly'; start_date: string; end_date: string }) => {
    if (!editingBudget) return

    try {
      await updateBudget({ id: editingBudget.id, updates: budgetData })
      showOperationSuccess("actualizar", "Presupuesto")
      setIsEditModalOpen(false)
      setEditingBudget(null)
    } catch (error) {
      showOperationError("actualizar", "presupuesto", error instanceof Error ? error.message : undefined)
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingBudget(null)
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage <= 50) {
      return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />En Control</Badge>
    } else if (percentage <= 80) {
      return <Badge className="bg-yellow-600"><TrendingUp className="mr-1 h-3 w-3" />Moderado</Badge>
    } else if (percentage <= 100) {
      return <Badge className="bg-orange-600"><AlertTriangle className="mr-1 h-3 w-3" />Cerca del Límite</Badge>
    } else {
      return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Excedido</Badge>
    }
  }

  // Funciones de formateo movidas a @/lib/formatters

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Presupuestos</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-muted-foreground">
            Controla tus gastos estableciendo límites por categoría - {activeContext.name}
          </p>
          <Badge variant={activeContext.user_role === 'owner' ? 'default' : 'secondary'} className="text-xs">
            {activeContext.user_role === 'owner' ? 'Propietario' : 'Miembro'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario para Nuevo Presupuesto */}
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Presupuesto</CardTitle>
            <CardDescription>
              Establece un límite de gasto para una categoría específica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budgetName">Nombre del Presupuesto</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="budgetName"
                    placeholder="Ej: Alimentación Enero"
                    className="pl-10"
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {budgetName.length}/100 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetAmount">Monto Límite</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="budgetAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select value={budgetCategoryId} onValueChange={setBudgetCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      expenseCategories.length === 0
                        ? "No hay categorías de egresos"
                        : "Selecciona una categoría"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories
                      .filter(category => !budgets.some(budget => budget.category_id === category.id && budget.is_active))
                      .map((category) => (
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

              <div className="space-y-2">
                <Label htmlFor="periodo">Período</Label>
                <Select value={budgetPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mensual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fecha Inicio */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                  />
                </div>

                {/* Fecha Fin */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
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
                    Crear Presupuesto
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Modal de Edición */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Presupuesto</DialogTitle>
              <DialogDescription>
                Modifica los detalles del presupuesto seleccionado
              </DialogDescription>
            </DialogHeader>
            {editingBudget && (
              <EditBudgetForm
                budget={editingBudget}
                categories={expenseCategories}
                onSubmit={handleUpdateBudget}
                onCancel={handleCloseEditModal}
                isSubmitting={isUpdating}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Lista de Presupuestos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Presupuestos Activos</CardTitle>
              <CardDescription>
                Monitorea el progreso de tus presupuestos establecidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros y búsqueda */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar presupuestos..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'completed' | 'exceeded')}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="completed">Completados</SelectItem>
                      <SelectItem value="exceeded">Excedidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading || progressLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando presupuestos...</span>
                </div>
              ) : filteredBudgets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {searchTerm || filterStatus !== 'all' ? (
                    <>
                      <p>No se encontraron presupuestos</p>
                      <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </>
                  ) : (
                    <>
                      <p>No hay presupuestos registrados</p>
                      <p className="text-sm">Crea tu primer presupuesto usando el formulario</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] sm:max-h-96 overflow-y-auto overscroll-contain">
                  {filteredBudgets.map((budget) => {
                    const category = categories.find(c => c.id === budget.category_id)
                    const progress = budgetProgress?.find(p => p.id === budget.id)
                    const spent = progress?.spent || 0
                    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

                    return (
                      <div key={budget.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{category?.icon || '🎯'}</span>
                            <div>
                              <h3 className="font-medium">{budget.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {category?.name || 'Categoría eliminada'} • {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(percentage)}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditBudget(budget)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteBudget(budget.id, budget.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Gastado: {formatCurrency(spent)}</span>
                            <span>Límite: {formatCurrency(budget.amount)}</span>
                          </div>
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{percentage.toFixed(1)}% utilizado</span>
                            <span>Restante: {formatCurrency(Math.max(0, budget.amount - spent))}</span>
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
      </div>
    </div>
  )
}

// Componente para el formulario de edición
interface EditBudgetFormProps {
  budget: Budget
  categories: Array<{ id: string; name: string; icon?: string }>
  onSubmit: (data: { name: string; amount: number; category_id: string; period: 'weekly' | 'monthly' | 'yearly'; start_date: string; end_date: string }) => void
  onCancel: () => void
  isSubmitting: boolean
}

function EditBudgetForm({ budget, categories, onSubmit, onCancel, isSubmitting }: EditBudgetFormProps) {
  const { showError } = useStandardToast()
  const [name, setName] = useState(budget.name)
  const [amount, setAmount] = useState(budget.amount.toString())
  const [categoryId, setCategoryId] = useState(budget.category_id)
  const [period, setPeriod] = useState(budget.period)
  const [startDate, setStartDate] = useState(dateUTCToBogota(budget.start_date).split('T')[0])
  const [endDate, setEndDate] = useState(dateUTCToBogota(budget.end_date).split('T')[0])

  const calculateEndDate = (start: string, selectedPeriod: string) => {
    const startDate = new Date(start)
    const endDate = new Date(startDate)
    
    switch (selectedPeriod) {
      case 'weekly':
        endDate.setDate(startDate.getDate() + 6)
        break
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1)
        endDate.setDate(endDate.getDate() - 1)
        break
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + 1)
        endDate.setDate(endDate.getDate() - 1)
        break
    }
    
    return endDate.toISOString().split('T')[0]
  }

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod as 'weekly' | 'monthly' | 'yearly')
    if (startDate) {
      const newEndDate = calculateEndDate(startDate, newPeriod)
      setEndDate(newEndDate)
    }
  }

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate)
    const newEndDate = calculateEndDate(newStartDate, period)
    setEndDate(newEndDate)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isNotEmpty(name)) {
       showError(VALIDATION_MESSAGES.REQUIRED, "Error de validación")
       return
     }
 
     if (!isPositiveNumber(amount)) {
       showError(VALIDATION_MESSAGES.POSITIVE_NUMBER, "Error de validación")
       return
     }
 
     if (!categoryId) {
       showError("Por favor selecciona una categoría", "Error de validación")
       return
     }
 
     if (!startDate || !endDate) {
       showError("Por favor selecciona las fechas del presupuesto", "Error de validación")
       return
     }
 
     if (!isEndDateAfterStartDate(startDate, endDate)) {
       showError(VALIDATION_MESSAGES.END_AFTER_START, "Error de validación")
       return
     }

     const trimmedName = name.trim()

    onSubmit({
      name: trimmedName,
      amount: parseFloat(amount),
      category_id: categoryId,
      period: period as 'weekly' | 'monthly' | 'yearly',
      start_date: dateInputToUTC(startDate),
      end_date: dateInputToUTC(endDate)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-nombre">Nombre del Presupuesto</Label>
        <div className="relative">
          <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="edit-nombre"
            placeholder="Ej: Alimentación Enero"
            className="pl-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {name.length}/100 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-monto">Monto Límite</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="edit-monto"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="pl-10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-categoria">Categoría</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center space-x-2">
                  <span>{category.icon || '📁'}</span>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-periodo">Período</Label>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Mensual" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensual</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-fechaInicio">Fecha Inicio</Label>
          <Input
            id="edit-fechaInicio"
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-fechaFin">Fecha Fin</Label>
          <Input
            id="edit-fechaFin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            'Actualizar Presupuesto'
          )}
        </Button>
      </div>
    </form>
  )
}