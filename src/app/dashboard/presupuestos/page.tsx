"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useBudgets, useBudgetProgress } from "@/hooks/useBudgets"
import { useCategories } from "@/hooks/useCategories"
import { 
  Plus, 
  Target, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Loader2
} from "lucide-react"

export default function PresupuestosPage() {
  const [nombrePresupuesto, setNombrePresupuesto] = useState('')
  const [montoPresupuesto, setMontoPresupuesto] = useState('')
  const [categoriaPresupuesto, setCategoriaPresupuesto] = useState('')
  const [periodoPresupuesto, setPeriodoPresupuesto] = useState('monthly')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()
  const { budgets, loading: budgetsLoading, createBudget, deleteBudget } = useBudgets()
  const { budgetProgress, loading: progressLoading } = useBudgetProgress()
  const { categories, getCategoriesByType } = useCategories()

  const expenseCategories = getCategoriesByType('expense')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nombrePresupuesto.trim() || !montoPresupuesto || !categoriaPresupuesto) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const startDate = new Date()
      let endDate = new Date()
      
      // Calcular fecha de fin según el período
      switch (periodoPresupuesto) {
        case 'weekly':
          endDate.setDate(startDate.getDate() + 7)
          break
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1)
          break
        case 'yearly':
          endDate.setFullYear(startDate.getFullYear() + 1)
          break
      }

      await createBudget({
        name: nombrePresupuesto.trim(),
        amount: parseFloat(montoPresupuesto),
        category_id: categoriaPresupuesto,
        period: periodoPresupuesto as 'weekly' | 'monthly' | 'yearly',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      })

      // Limpiar formulario
      setNombrePresupuesto('')
      setMontoPresupuesto('')
      setCategoriaPresupuesto('')

      toast({
        title: "¡Éxito!",
        description: "Presupuesto creado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el presupuesto. Inténtalo de nuevo.",
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
        description: "No se pudo eliminar el presupuesto. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusIcon = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (percentage >= 80) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const formatPeriod = (period: string) => {
    const periods = {
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual'
    }
    return periods[period as keyof typeof periods] || period
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
                <Select value={categoriaPresupuesto} onValueChange={setCategoriaPresupuesto}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      expenseCategories.length === 0
                        ? "No hay categorías de egresos"
                        : "Selecciona una categoría"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
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
                <Select value={periodoPresupuesto} onValueChange={setPeriodoPresupuesto}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
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
                Seguimiento de tus presupuestos actuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              {budgetsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando presupuestos...</span>
                </div>
              ) : budgets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay presupuestos registrados</p>
                  <p className="text-sm">Crea tu primer presupuesto usando el formulario</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {budgets.map((budget) => {
                    const progress = budgetProgress.find(p => p.budget_id === budget.id)
                    const spent = progress?.spent || 0
                    const percentage = (spent / budget.amount) * 100
                    const remaining = budget.amount - spent
                    const category = categories.find(c => c.id === budget.category_id)
                    
                    return (
                      <div key={budget.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(spent, budget.amount)}
                            <h3 className="font-semibold">{budget.name}</h3>
                            <Badge variant="secondary">
                              {category?.icon} {category?.name || 'Sin categoría'}
                            </Badge>
                            <Badge variant="outline">
                              {formatPeriod(budget.period)}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteBudget(budget.id, budget.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Gastado: ${spent.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                            <span>Límite: ${budget.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                          </div>
                          
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className="h-2"
                          />
                          
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{percentage.toFixed(1)}% utilizado</span>
                            <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {remaining >= 0 
                                ? `$${remaining.toLocaleString('es-ES', { minimumFractionDigits: 2 })} restante` 
                                : `$${Math.abs(remaining).toLocaleString('es-ES', { minimumFractionDigits: 2 })} excedido`
                              }
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-xs text-muted-foreground pt-2">
                            <span>Inicio: {formatDate(budget.start_date)}</span>
                            <span>Fin: {formatDate(budget.end_date)}</span>
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