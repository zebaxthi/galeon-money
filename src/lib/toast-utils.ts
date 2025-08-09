/**
 * Utilidades de toast centralizadas
 * Funciones reutilizables para mostrar notificaciones consistentes
 */

import { useToast } from '@/hooks/use-toast'

/**
 * Hook personalizado que proporciona funciones de toast estandarizadas
 */
export const useStandardToast = () => {
  const { toast } = useToast()

  /**
   * Muestra un toast de éxito
   * @param message - Mensaje a mostrar
   * @param title - Título del toast (default: "¡Éxito!")
   */
  const showSuccess = (message: string, title: string = "¡Éxito!") => {
    toast({
      title,
      description: message,
    })
  }

  /**
   * Muestra un toast de error
   * @param message - Mensaje de error a mostrar
   * @param title - Título del toast (default: "Error")
   */
  const showError = (message: string, title: string = "Error") => {
    toast({
      title,
      description: message,
      variant: "destructive"
    })
  }

  /**
   * Muestra un toast de información
   * @param message - Mensaje informativo a mostrar
   * @param title - Título del toast (default: "Información")
   */
  const showInfo = (message: string, title: string = "Información") => {
    toast({
      title,
      description: message,
    })
  }

  /**
   * Muestra un toast de advertencia
   * @param message - Mensaje de advertencia a mostrar
   * @param title - Título del toast (default: "Advertencia")
   */
  const showWarning = (message: string, title: string = "Advertencia") => {
    toast({
      title,
      description: message,
      variant: "destructive"
    })
  }

  /**
   * Muestra un toast de validación (para errores de formulario)
   * @param message - Mensaje de validación
   */
  const showValidationError = (message: string) => {
    toast({
      title: "Error de validación",
      description: message,
      variant: "destructive"
    })
  }

  /**
   * Muestra un toast de operación exitosa (CRUD)
   * @param operation - Tipo de operación ('crear', 'actualizar', 'eliminar')
   * @param entity - Entidad afectada (ej: 'movimiento', 'presupuesto', 'categoría')
   */
  const showOperationSuccess = (operation: string, entity: string) => {
    const messages = {
      crear: `${entity} creado exitosamente`,
      actualizar: `${entity} actualizado exitosamente`,
      eliminar: `${entity} eliminado exitosamente`
    }
    
    const message = messages[operation as keyof typeof messages] || `Operación completada exitosamente`
    showSuccess(message)
  }

  /**
   * Muestra un toast de error de operación (CRUD)
   * @param operation - Tipo de operación ('crear', 'actualizar', 'eliminar')
   * @param entity - Entidad afectada
   * @param error - Error específico (opcional)
   */
  const showOperationError = (operation: string, entity: string, error?: string) => {
    const messages = {
      crear: `Error al crear ${entity}`,
      actualizar: `Error al actualizar ${entity}`,
      eliminar: `Error al eliminar ${entity}`
    }
    
    const baseMessage = messages[operation as keyof typeof messages] || `Error en la operación`
    const message = error ? `${baseMessage}: ${error}` : baseMessage
    showError(message)
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showValidationError,
    showOperationSuccess,
    showOperationError
  }
}

/**
 * Mensajes estándar para operaciones CRUD
 */
export const TOAST_MESSAGES = {
  SUCCESS: {
    CREATE: (entity: string) => `${entity} creado exitosamente`,
    UPDATE: (entity: string) => `${entity} actualizado exitosamente`,
    DELETE: (entity: string) => `${entity} eliminado exitosamente`,
    SAVE: 'Cambios guardados exitosamente',
    EXPORT: 'Datos exportados exitosamente'
  },
  ERROR: {
    CREATE: (entity: string) => `Error al crear ${entity}`,
    UPDATE: (entity: string) => `Error al actualizar ${entity}`,
    DELETE: (entity: string) => `Error al eliminar ${entity}`,
    SAVE: 'Error al guardar los cambios',
    EXPORT: 'Error al exportar los datos',
    VALIDATION: 'Por favor, corrige los errores en el formulario',
    NETWORK: 'Error de conexión. Inténtalo de nuevo.',
    PERMISSION: 'No tienes permisos para realizar esta acción'
  }
} as const