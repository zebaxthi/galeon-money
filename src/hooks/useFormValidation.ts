"use client"

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ValidationRule {
  test: (value: string | number) => boolean
  message: string
}

interface FormValidationConfig {
  [key: string]: ValidationRule[]
}

export function useFormValidation<T extends Record<string, string | number>>(
  initialValues: T,
  validationConfig: FormValidationConfig
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const setValue = (key: keyof T, value: string | number) => {
    setValues(prev => ({ ...prev, [key]: value }))
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  const validateField = (key: keyof T, value: string | number): string | null => {
    const rules = validationConfig[key as string]
    if (!rules) return null

    for (const rule of rules) {
      if (!rule.test(value)) {
        return rule.message
      }
    }
    return null
  }

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let hasErrors = false

    Object.keys(validationConfig).forEach(key => {
      const value = values[key as keyof T]
      const error = validateField(key as keyof T, value)
      if (error) {
        newErrors[key as keyof T] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)

    // Show first error in toast
    if (hasErrors) {
      const firstError = Object.values(newErrors)[0]
      if (firstError) {
        toast({
          title: "Error de validación",
          description: firstError,
          variant: "destructive"
        })
      }
    }

    return !hasErrors
  }

  const handleSubmit = async (
    onSubmit: (values: T) => Promise<void>,
    onSuccess?: () => void
  ) => {
    if (!validateAll()) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitting(false)
  }

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    validateField,
    validateAll,
    handleSubmit,
    reset
  }
}

// Common validation rules
export const validationRules = {
  required: (message = "Este campo es requerido"): ValidationRule => ({
    test: (value) => value !== null && value !== undefined && value !== '',
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => typeof value === 'string' && value.trim().length >= min,
    message: message || `Debe tener al menos ${min} caracteres`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => typeof value === 'string' && value.trim().length <= max,
    message: message || `No puede exceder ${max} caracteres`
  }),

  positiveNumber: (message = "Debe ser un número mayor a 0"): ValidationRule => ({
    test: (value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value as number
      return !isNaN(num) && num > 0
    },
    message
  }),

  dateAfter: (compareDate: string, message = "La fecha debe ser posterior"): ValidationRule => ({
    test: (value) => {
      if (!value || !compareDate) return false
      return new Date(value) > new Date(compareDate)
    },
    message
  }),

  unique: (existingValues: string[], message = "Ya existe un elemento con este valor"): ValidationRule => ({
    test: (value) => {
      if (!value) return true
      return !existingValues.some(existing => 
        existing.toLowerCase() === value.toString().toLowerCase()
      )
    },
    message
  })
}