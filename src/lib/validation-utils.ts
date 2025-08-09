/**
 * Utilidades de validación centralizadas
 * Funciones reutilizables para validar datos de entrada
 */

/**
 * Valida si un string no está vacío después de hacer trim
 * @param value - Valor a validar
 * @returns true si el valor es válido
 */
export const isNotEmpty = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0
}

/**
 * Valida si un string tiene una longitud mínima
 * @param value - Valor a validar
 * @param minLength - Longitud mínima requerida
 * @returns true si el valor cumple la longitud mínima
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength
}

/**
 * Valida si un string tiene una longitud máxima
 * @param value - Valor a validar
 * @param maxLength - Longitud máxima permitida
 * @returns true si el valor no excede la longitud máxima
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength
}

/**
 * Valida si un string está dentro de un rango de longitud
 * @param value - Valor a validar
 * @param minLength - Longitud mínima
 * @param maxLength - Longitud máxima
 * @returns true si el valor está dentro del rango
 */
export const isWithinLengthRange = (value: string, minLength: number, maxLength: number): boolean => {
  const trimmedLength = value.trim().length
  return trimmedLength >= minLength && trimmedLength <= maxLength
}

/**
 * Valida si un valor es un número positivo
 * @param value - Valor a validar (string o number)
 * @returns true si es un número positivo
 */
export const isPositiveNumber = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num > 0
}

/**
 * Valida si un valor es un número válido (incluyendo cero)
 * @param value - Valor a validar (string o number)
 * @returns true si es un número válido
 */
export const isValidNumber = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && isFinite(num)
}

/**
 * Valida si un valor está dentro de un rango numérico
 * @param value - Valor a validar
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns true si está dentro del rango
 */
export const isWithinRange = (value: string | number, min: number, max: number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isValidNumber(num) && num >= min && num <= max
}

/**
 * Valida si un email tiene formato válido
 * @param email - Email a validar
 * @returns true si el formato es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Valida si una fecha es válida
 * @param dateString - Fecha en formato string
 * @returns true si la fecha es válida
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Valida si una fecha está en el futuro
 * @param dateString - Fecha en formato string
 * @returns true si la fecha es futura
 */
export const isFutureDate = (dateString: string): boolean => {
  if (!isValidDate(dateString)) return false
  const date = new Date(dateString)
  const now = new Date()
  return date > now
}

/**
 * Valida si una fecha está en el pasado
 * @param dateString - Fecha en formato string
 * @returns true si la fecha es pasada
 */
export const isPastDate = (dateString: string): boolean => {
  if (!isValidDate(dateString)) return false
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}

/**
 * Valida si una fecha de fin es posterior a una fecha de inicio
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns true si la fecha de fin es posterior
 */
export const isEndDateAfterStartDate = (startDate: string, endDate: string): boolean => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false
  return new Date(endDate) > new Date(startDate)
}

/**
 * Limpia y valida un string de entrada
 * @param value - Valor a limpiar
 * @param minLength - Longitud mínima (opcional)
 * @param maxLength - Longitud máxima (opcional)
 * @returns Objeto con el valor limpio y estado de validación
 */
export const cleanAndValidateString = (
  value: string,
  minLength?: number,
  maxLength?: number
): { cleanValue: string; isValid: boolean; error?: string } => {
  const cleanValue = value.trim()
  
  if (!isNotEmpty(cleanValue)) {
    return { cleanValue, isValid: false, error: 'Este campo es requerido' }
  }
  
  if (minLength && !hasMinLength(cleanValue, minLength)) {
    return { 
      cleanValue, 
      isValid: false, 
      error: `Debe tener al menos ${minLength} caracteres` 
    }
  }
  
  if (maxLength && !hasMaxLength(cleanValue, maxLength)) {
    return { 
      cleanValue, 
      isValid: false, 
      error: `No puede exceder ${maxLength} caracteres` 
    }
  }
  
  return { cleanValue, isValid: true }
}

/**
 * Valida y convierte un string a número
 * @param value - Valor a convertir
 * @param allowZero - Si permite cero como valor válido
 * @returns Objeto con el número convertido y estado de validación
 */
export const validateAndParseNumber = (
  value: string,
  allowZero: boolean = false
): { number: number; isValid: boolean; error?: string } => {
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return { number: 0, isValid: false, error: 'Debe ser un número válido' }
  }
  
  if (!allowZero && num <= 0) {
    return { number: num, isValid: false, error: 'Debe ser mayor a 0' }
  }
  
  if (allowZero && num < 0) {
    return { number: num, isValid: false, error: 'No puede ser negativo' }
  }
  
  return { number: num, isValid: true }
}

/**
 * Mensajes de error estándar para validaciones
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'Formato de email inválido',
  INVALID_NUMBER: 'Debe ser un número válido',
  POSITIVE_NUMBER: 'Debe ser mayor a 0',
  NON_NEGATIVE: 'No puede ser negativo',
  INVALID_DATE: 'Fecha inválida',
  FUTURE_DATE: 'La fecha debe ser futura',
  PAST_DATE: 'La fecha debe ser pasada',
  END_AFTER_START: 'La fecha de fin debe ser posterior a la fecha de inicio',
  MIN_LENGTH: (min: number) => `Debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (max: number) => `No puede exceder ${max} caracteres`,
  RANGE_LENGTH: (min: number, max: number) => `Debe tener entre ${min} y ${max} caracteres`
} as const