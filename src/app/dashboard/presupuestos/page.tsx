'use client'

import { useState, useEffect } from 'react'
import { useBudgets, useBudgetProgress } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { useActiveFinancialContext } from '@/providers/financial-context-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  getCurrentBogotaDate, 
  dateInputToUTC, 
  dateUTCToBogota, 
  formatDateForDisplay 
} from '@/lib/utils'
import { 
  Target, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Plus,
  Trash2,
  Search,
  Filter,
  Wallet
} from 'lucide-react'
import Link from "next/link"

export default function PresupuestosPage() {
  // Todos los hooks deben ir al principio, antes de cualquier return
  const [nombrePresupuesto, setNombrePresupuesto] = useState('')
  const [montoPresupuesto, setMontoPresupuesto] = useState('')
  const [categoriaPresupuesto, setCategoriaPresupuesto] = useState('')
  const [periodoPresupuesto, setPeriodoPresupuesto] = useState('monthly')
  const [fechaInicio, setFechaInicio] = useState(getCurrentBogotaDate())
  const [fechaFin, setFechaFin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'exceeded' | 'completed'>('all')

  const { activeContext, isLoading: contextLoading } = useActiveFinancialContext()
  const { budgets, loading, createBudget, deleteBudget } = useBudgets(activeContext?.id)
  const { budgetProgress, loading: progressLoading } = useBudgetProgress(activeContext?.id)
  const { categories, getCategoriesByType } = useCategories(activeContext?.id)
  const { toast } = useToast()

  // Calcular fecha de fin automática
  const calculateEndDate = (startDate: string, period: string) => {
    const start = new Date(startDate)
    let end = new Date(start)
    
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
    if (fechaInicio) {
      const newEndDate = calculateEndDate(fechaInicio, periodoPresupuesto)
      setFechaFin(newEndDate)
    }
  }, [fechaInicio, periodoPresupuesto])

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
            <Link href="/dashboard/ajustes">
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
    setPeriodoPresupuesto(period)
  }

  const handleStartDateChange = (date: string) => {
    setFechaInicio(date)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones del frontend
    const trimmedName = nombrePresupuesto.trim()
    
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para el presupuesto",
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

    if (trimmedName.length > 100) {
      toast({
        title: "Error",
        description: "El nombre no puede exceder 100 caracteres",
        variant: "destructive"
      })
      return
    }

    if (!montoPresupuesto || parseFloat(montoPresupuesto) <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa un monto válido mayor a 0",
        variant: "destructive"
      })
      return
    }

    if (!categoriaPresupuesto) {
      toast({
        title: "Error",
        description: "Por favor selecciona una categoría",
        variant: "destructive"
      })
      return
    }

    if (!fechaInicio || !fechaFin) {
      toast({
        title: "Error",
        description: "Por favor selecciona las fechas del presupuesto",
        variant: "destructive"
      })
      return
    }

    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      toast({
        title: "Error",
        description: "La fecha de fin debe ser posterior a la fecha de inicio",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await createBudget({
        name: trimmedName,
        amount: parseFloat(montoPresupuesto),
        category_id: categoriaPresupuesto,
        period: periodoPresupuesto as 'weekly' | 'monthly' | 'yearly',
        start_date: dateInputToUTC(fechaInicio), // Convertir a UTC
        end_date: dateInputToUTC(fechaFin), // Convertir a UTC
        context_id: activeContext?.id
      })

      // Reset form
      setNombrePresupuesto('')
      setMontoPresupuesto('')
      setCategoriaPresupuesto('')
      setPeriodoPresupuesto('monthly')
      setFechaInicio(getCurrentBogotaDate())
      setFechaFin('')
      
      toast({
        title: "Presupuesto creado",
        description: `Presupuesto "${trimmedName}" creado exitosamente.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el presupuesto. Inténtalo de nuevo.",
        variant: "destructive"
      })
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
      toast({
        title: "Presupuesto eliminado",
        description: `El presupuesto "${name}" ha sido eliminado correctamente`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el presupuesto. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage <= 50) return 'bg-green-500'
    if (percentage <= 80) return 'bg-yellow-500'
    if (percentage <= 100) return 'bg-orange-500'
    return 'bg-red-500'
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateUTCToBogota(dateString), true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Presupuestos</h1>
        <p className="text-muted-foreground">
          Controla tus gastos estableciendo límites por categoría
        </p>
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
                <Label htmlFor="nombre">Nombre del Presupuesto</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nombre"
                    placeholder="Ej: Alimentación Enero"
                    className="pl-10"
                    value={nombrePresupuesto}
                    onChange={(e) => setNombrePresupuesto(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {nombrePresupuesto.length}/100 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto Límite</Label>
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
                <Label htmlFor="categoria">Categoría</Label>
                <Select value={categoriaPresupuesto} onValueChange={setCategoriaPresupuesto}>
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
                <Select value={periodoPresupuesto} onValueChange={handlePeriodChange}>
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
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                  />
                </div>

                {/* Fecha Fin */}
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
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
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
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
                <div className="space-y-4 max-h-96 overflow-y-auto">
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