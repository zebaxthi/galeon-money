import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const toasts: Toast[] = []
const listeners: Array<(toasts: Toast[]) => void> = []

let toastCount = 0

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_VALUE
  return toastCount.toString()
}

function addToast(toast: Omit<Toast, 'id'>) {
  const id = genId()
  const newToast = { ...toast, id }
  toasts.push(newToast)
  listeners.forEach((listener) => listener([...toasts]))
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(id)
  }, 5000)
  
  return id
}

function removeToast(id: string) {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.splice(index, 1)
    listeners.forEach((listener) => listener([...toasts]))
  }
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([...toasts])

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    return addToast(props)
  }, [])

  const dismiss = useCallback((id: string) => {
    removeToast(id)
  }, [])

  // Subscribe to toast changes
  useState(() => {
    listeners.push(setToastList)
    return () => {
      const index = listeners.indexOf(setToastList)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  })

  return {
    toast,
    dismiss,
    toasts: toastList
  }
}