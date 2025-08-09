/**
 * Utilidades de formateo centralizadas
 * Funciones reutilizables para formatear monedas, fechas y otros datos
 */

import { formatDateForDisplay, dateUTCToBogota } from './utils'

/**
 * Formatea un monto como moneda colombiana
 * @param amount - El monto a formatear
 * @returns String formateado como moneda COP
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount)
}

/**
 * Formatea un monto con signo según el tipo de movimiento
 * @param amount - El monto a formatear
 * @param type - Tipo de movimiento ('income' | 'expense')
 * @returns String formateado con signo y moneda
 */
export const formatAmount = (amount: number, type?: 'income' | 'expense'): string => {
  if (!type) {
    return formatCurrency(amount)
  }
  
  const prefix = type === 'income' ? '+' : '-'
  return `${prefix}${formatCurrency(Math.abs(amount)).replace(/^[^\d]*/, '')}`
}

/**
 * Formatea una fecha UTC a formato local legible
 * @param dateString - Fecha en formato string UTC
 * @param isFromUTC - Si la fecha viene en formato UTC (default: true)
 * @returns String de fecha formateada
 */
export const formatDate = (dateString: string, isFromUTC: boolean = true): string => {
  if (isFromUTC) {
    return formatDateForDisplay(dateUTCToBogota(dateString), true)
  }
  return formatDateForDisplay(dateString, false)
}

/**
 * Formatea un número como porcentaje
 * @param value - Valor numérico (0-100)
 * @param decimals - Número de decimales (default: 1)
 * @returns String formateado como porcentaje
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formatea un número grande con separadores de miles
 * @param value - Valor numérico
 * @returns String formateado con separadores
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-ES').format(value)
}

/**
 * Trunca un texto a una longitud específica
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @param suffix - Sufijo a agregar (default: '...')
 * @returns Texto truncado
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}