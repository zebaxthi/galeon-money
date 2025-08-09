"use client"

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { CrudOperationsConfig } from '@/lib/types'

export function useCrudOperations<T extends { id: string; name?: string }>(
  config: CrudOperationsConfig
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const { 
    entityName, 
    confirmDelete = true,
    successMessages = {}
  } = config

  const handleCreate = async (
    createFn: () => Promise<void>,
    onSuccess?: () => void,
    customSuccessMessage?: string
  ) => {
    setIsSubmitting(true)
    try {
      await createFn()
      toast({
        title: "¡Éxito!",
        description: customSuccessMessage || successMessages.create || `${entityName} creado correctamente`,
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `No se pudo crear el ${entityName}. Inténtalo de nuevo.`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (
    updateFn: () => Promise<void>,
    itemName?: string,
    onSuccess?: () => void,
    customSuccessMessage?: string
  ) => {
    setIsSubmitting(true)
    try {
      await updateFn()
      const message = customSuccessMessage || 
        successMessages.update || 
        `${entityName}${itemName ? ` "${itemName}"` : ''} actualizado correctamente`
      
      toast({
        title: "¡Éxito!",
        description: message,
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `No se pudo actualizar el ${entityName}. Inténtalo de nuevo.`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (
    deleteFn: () => Promise<void>,
    item: T,
    onSuccess?: () => void,
    customSuccessMessage?: string,
    customConfirmMessage?: string
  ) => {
    const itemName = item.name || item.id
    
    if (confirmDelete) {
      const confirmMessage = customConfirmMessage || 
        `¿Estás seguro de que quieres eliminar ${entityName === 'categoría' ? 'la' : 'el'} ${entityName} "${itemName}"?`
      
      if (!confirm(confirmMessage)) {
        return
      }
    }

    setIsDeleting(item.id)
    try {
      await deleteFn()
      const message = customSuccessMessage || 
        successMessages.delete || 
        `${entityName === 'categoría' ? 'La' : 'El'} ${entityName} "${itemName}" ha sido eliminado correctamente`
      
      toast({
        title: `${entityName === 'categoría' ? 'Categoría' : entityName} eliminado`,
        description: message,
      })
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 
        `No se pudo eliminar ${entityName === 'categoría' ? 'la' : 'el'} ${entityName}. ${entityName === 'categoría' ? 'Puede que tenga movimientos asociados.' : 'Inténtalo de nuevo.'}`
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const showSuccessToast = (message: string, title = "¡Éxito!") => {
    toast({
      title,
      description: message,
    })
  }

  const showErrorToast = (message: string, title = "Error") => {
    toast({
      title,
      description: message,
      variant: "destructive"
    })
  }

  return {
    isSubmitting,
    isDeleting,
    handleCreate,
    handleUpdate,
    handleDelete,
    showSuccessToast,
    showErrorToast
  }
}