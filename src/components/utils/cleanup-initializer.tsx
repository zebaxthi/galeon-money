'use client'

import { useEffect } from 'react'
import { initializeCleanupUtilities } from '@/utils/cleanup-invalid-contexts'

/**
 * Component that initializes cleanup utilities on the client side
 * This makes the cleanup functions available in the browser console
 */
export function CleanupInitializer() {
  useEffect(() => {
    initializeCleanupUtilities()
  }, [])

  return null // This component doesn't render anything
}