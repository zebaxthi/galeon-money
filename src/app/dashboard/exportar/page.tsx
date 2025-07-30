"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  CheckCircle,
  Loader2
} from "lucide-react"
import { useExport } from "@/hooks/useExport"
import { useMovements } from "@/hooks/useMovements"

export default function ExportarPage() {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [tipoReporte, setTipoReporte] = useState('completo')
  const [incluirCategorias, setIncluirCategorias] = useState(true)
  const [incluirPresupuestos, setIncluirPresupuestos] = useState(true)
  const [incluirEstadisticas, setIncluirEstadisticas] = useState(false)

  const { generateExport, loading, error } = useExport()
  const { movements } = useMovements()
  const { toast } = useToast()

  // Establecer fechas por defecto (último mes)
  useEffect(() => {
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    
    setFechaInicio(lastMonth.toISOString().split('T')[0])
    setFechaFin(endOfLastMonth.toISOString().split('T')[0])
  }, [])

  const handleExport = async () => {
    try {
      const result = await generateExport(
        fechaInicio,
        fechaFin,
        tipoReporte as 'completo' | 'movimientos' | 'resumen',
        {
          incluirCategorias,
          incluirPresupuestos,
          incluirEstadisticas
        }
      )

      toast({
        title: "Exportación exitosa",
        description: `Se ha descargado el archivo: ${result.fileName}`,
      })
    } catch (err) {
      toast({
        title: "Error en la exportación",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive"
      })
    }
  }

  const reportesDisponibles = [
    {
      id: 'completo',
      nombre: 'Reporte Completo',
      descripcion: 'Incluye movimientos detallados y resumen por categorías',
      icono: FileSpreadsheet,
      color: 'text-violet-600'
    },
    {
      id: 'movimientos',
      nombre: 'Solo Movimientos',
      descripcion: 'Lista detallada de todas las transacciones',
      icono: FileSpreadsheet,
      color: 'text-blue-600'
    },
    {
      id: 'resumen',
      nombre: 'Resumen por Categorías',
      descripcion: 'Totales agrupados por categoría',
      icono: FileSpreadsheet,
      color: 'text-green-600'
    }
  ]

  // Filtrar movimientos por rango de fechas para vista previa
  const movimientosFiltrados = movements.filter(movement => {
    if (!fechaInicio || !fechaFin) return true
    const movementDate = new Date(movement.movement_date)
    const startDate = new Date(fechaInicio)
    const endDate = new Date(fechaFin)
    return movementDate >= startDate && movementDate <= endDate
  })

  const totalIngresos = movimientosFiltrados
    .filter(m => m.type === 'income')
    .reduce((sum, m) => sum + Number(m.amount), 0)

  const totalEgresos = movimientosFiltrados
    .filter(m => m.type === 'expense')
    .reduce((sum, m) => sum + Number(m.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exportar Datos</h1>
        <p className="text-muted-foreground">
          Genera reportes en Excel de tus datos financieros
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuración de Exportación */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Exportación</CardTitle>
            <CardDescription>
              Personaliza tu reporte antes de exportar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rango de Fechas */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Rango de Fechas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Reporte */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Tipo de Reporte
              </h3>
              <div className="space-y-3">
                {reportesDisponibles.map((reporte) => {
                  const Icon = reporte.icono
                  return (
                    <div key={reporte.id} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={reporte.id}
                        name="tipoReporte"
                        value={reporte.id}
                        checked={tipoReporte === reporte.id}
                        onChange={(e) => setTipoReporte(e.target.value)}
                        className="text-violet-600"
                      />
                      <label htmlFor={reporte.id} className="flex items-center space-x-2 cursor-pointer">
                        <Icon className={`h-4 w-4 ${reporte.color}`} />
                        <div>
                          <p className="font-medium">{reporte.nombre}</p>
                          <p className="text-sm text-muted-foreground">{reporte.descripcion}</p>
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Opciones Adicionales */}
            <div className="space-y-4">
              <h3 className="font-medium">Incluir Datos Adicionales</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="categorias"
                    checked={incluirCategorias}
                    onCheckedChange={setIncluirCategorias}
                  />
                  <Label htmlFor="categorias">Información de categorías</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="presupuestos"
                    checked={incluirPresupuestos}
                    onCheckedChange={setIncluirPresupuestos}
                  />
                  <Label htmlFor="presupuestos">Estado de presupuestos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="estadisticas"
                    checked={incluirEstadisticas}
                    onCheckedChange={setIncluirEstadisticas}
                  />
                  <Label htmlFor="estadisticas">Estadísticas generales</Label>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button 
              onClick={handleExport} 
              className="w-full" 
              size="lg"
              disabled={loading || !fechaInicio || !fechaFin}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando reporte...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar a Excel
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Vista Previa */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>
              Datos que se incluirán en tu reporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Resumen del Reporte
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Período:</strong> {fechaInicio || 'No especificado'} - {fechaFin || 'No especificado'}</p>
                  <p><strong>Tipo:</strong> {reportesDisponibles.find(r => r.id === tipoReporte)?.nombre}</p>
                  <p><strong>Movimientos:</strong> {movimientosFiltrados.length} registros</p>
                  <p><strong>Total Ingresos:</strong> <span className="text-green-600">${totalIngresos.toLocaleString()}</span></p>
                  <p><strong>Total Egresos:</strong> <span className="text-red-600">${totalEgresos.toLocaleString()}</span></p>
                  <p><strong>Saldo Neto:</strong> <span className={totalIngresos - totalEgresos >= 0 ? 'text-green-600' : 'text-red-600'}>${(totalIngresos - totalEgresos).toLocaleString()}</span></p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Últimos Movimientos</h4>
                {movimientosFiltrados.length > 0 ? (
                  movimientosFiltrados.slice(0, 3).map((movimiento, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{movimiento.description || 'Sin descripción'}</p>
                        <p className="text-xs text-muted-foreground">
                          {movimiento.categories?.name || 'Sin categoría'} • {movimiento.movement_date}
                        </p>
                      </div>
                      <span className={`font-bold text-sm ${
                        movimiento.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimiento.type === 'income' ? '+' : '-'}${Number(movimiento.amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No hay movimientos en el período seleccionado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}