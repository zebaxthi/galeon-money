"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  CheckCircle
} from "lucide-react"
import * as XLSX from 'xlsx'

export default function ExportarPage() {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [tipoReporte, setTipoReporte] = useState('completo')
  const [incluirCategorias, setIncluirCategorias] = useState(true)
  const [incluirPresupuestos, setIncluirPresupuestos] = useState(true)
  const [incluirEstadisticas, setIncluirEstadisticas] = useState(false)

  // Datos de ejemplo para exportar
  const datosMovimientos = [
    { fecha: '2024-01-15', tipo: 'Egreso', categoria: 'Alimentación', descripcion: 'Supermercado', monto: -45.50 },
    { fecha: '2024-01-15', tipo: 'Ingreso', categoria: 'Trabajo', descripcion: 'Salario', monto: 2500.00 },
    { fecha: '2024-01-14', tipo: 'Egreso', categoria: 'Transporte', descripcion: 'Gasolina', monto: -60.00 },
    { fecha: '2024-01-13', tipo: 'Egreso', categoria: 'Entretenimiento', descripcion: 'Cine', monto: -25.00 },
    { fecha: '2024-01-12', tipo: 'Egreso', categoria: 'Servicios', descripcion: 'Internet', monto: -50.00 },
  ]

  const datosResumen = [
    { categoria: 'Alimentación', ingresos: 0, egresos: 245.50, saldo: -245.50 },
    { categoria: 'Trabajo', ingresos: 2500.00, egresos: 0, saldo: 2500.00 },
    { categoria: 'Transporte', ingresos: 0, egresos: 180.00, saldo: -180.00 },
    { categoria: 'Entretenimiento', ingresos: 0, egresos: 125.00, saldo: -125.00 },
    { categoria: 'Servicios', ingresos: 0, egresos: 200.00, saldo: -200.00 },
  ]

  const exportarExcel = () => {
    const workbook = XLSX.utils.book_new()

    // Hoja de movimientos detallados
    if (tipoReporte === 'completo' || tipoReporte === 'movimientos') {
      const wsMovimientos = XLSX.utils.json_to_sheet(datosMovimientos)
      XLSX.utils.book_append_sheet(workbook, wsMovimientos, 'Movimientos')
    }

    // Hoja de resumen por categorías
    if (tipoReporte === 'completo' || tipoReporte === 'resumen') {
      const wsResumen = XLSX.utils.json_to_sheet(datosResumen)
      XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen por Categoría')
    }

    // Hoja de estadísticas (si está seleccionada)
    if (incluirEstadisticas) {
      const estadisticas = [
        { concepto: 'Total Ingresos', valor: 2500.00 },
        { concepto: 'Total Egresos', valor: 750.50 },
        { concepto: 'Saldo Neto', valor: 1749.50 },
        { concepto: 'Promedio Diario Gastos', valor: 25.02 },
      ]
      const wsEstadisticas = XLSX.utils.json_to_sheet(estadisticas)
      XLSX.utils.book_append_sheet(workbook, wsEstadisticas, 'Estadísticas')
    }

    // Generar y descargar el archivo
    const fechaActual = new Date().toISOString().split('T')[0]
    const nombreArchivo = `galeon-money-reporte-${fechaActual}.xlsx`
    XLSX.writeFile(workbook, nombreArchivo)
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

            <Button onClick={exportarExcel} className="w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Exportar a Excel
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
                  <p><strong>Movimientos:</strong> {datosMovimientos.length} registros</p>
                  <p><strong>Categorías:</strong> {datosResumen.length} categorías</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Últimos Movimientos</h4>
                {datosMovimientos.slice(0, 3).map((movimiento, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{movimiento.descripcion}</p>
                      <p className="text-xs text-muted-foreground">{movimiento.categoria}</p>
                    </div>
                    <span className={`font-bold text-sm ${
                      movimiento.monto > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${Math.abs(movimiento.monto).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}