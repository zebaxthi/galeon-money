import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Obtiene la fecha actual en zona horaria de Bogotá en formato YYYY-MM-DD
 */
export function getCurrentBogotaDate(): string {
  const now = new Date()
  const bogotaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }))
  
  const year = bogotaDate.getFullYear()
  const month = String(bogotaDate.getMonth() + 1).padStart(2, '0')
  const day = String(bogotaDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Convierte una fecha de input (YYYY-MM-DD) a UTC para guardar en la base de datos
 * Asume que la fecha del input es en zona horaria de Bogotá
 */
export function dateInputToUTC(dateString: string): string {
  // Crear fecha en zona horaria de Bogotá a las 12:00 PM para evitar problemas de DST
  const bogotaDateTime = new Date(dateString + 'T12:00:00')
  const bogotaDateInUTC = new Date(bogotaDateTime.toLocaleString("en-US", { timeZone: "UTC" }))
  
  // Obtener la diferencia entre Bogotá y UTC
  const bogotaDateLocal = new Date(bogotaDateTime.toLocaleString("en-US", { timeZone: "America/Bogota" }))
  const offset = bogotaDateInUTC.getTime() - bogotaDateLocal.getTime()
  
  // Aplicar el offset
  const utcDate = new Date(bogotaDateTime.getTime() + offset)
  
  const year = utcDate.getFullYear()
  const month = String(utcDate.getMonth() + 1).padStart(2, '0')
  const day = String(utcDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Convierte una fecha UTC de la base de datos a zona horaria de Bogotá para mostrar
 */
export function dateUTCToBogota(utcDateString: string): string {
  // Crear fecha UTC
  const utcDate = new Date(utcDateString + 'T12:00:00Z')
  
  // Convertir a zona horaria de Bogotá
  const bogotaDate = new Date(utcDate.toLocaleString("en-US", { timeZone: "America/Bogota" }))
  
  const year = bogotaDate.getFullYear()
  const month = String(bogotaDate.getMonth() + 1).padStart(2, '0')
  const day = String(bogotaDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Formatea una fecha para mostrar en la interfaz en español
 */
export function formatDateForDisplay(dateString: string, isFromUTC: boolean = true): string {
  const displayDate = isFromUTC ? dateUTCToBogota(dateString) : dateString
  const [year, month, day] = displayDate.split('-')
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  return `${parseInt(day)} de ${monthNames[parseInt(month) - 1]} de ${year}`
}

/**
 * Formatea una fecha corta para mostrar (DD/MM/YYYY)
 */
export function formatShortDate(dateString: string, isFromUTC: boolean = true): string {
  const displayDate = isFromUTC ? dateUTCToBogota(dateString) : dateString
  const [year, month, day] = displayDate.split('-')
  
  return `${day}/${month}/${year}`
}