/**
 * Utility functions to clean up invalid contexts from localStorage
 * This helps resolve issues with phantom contexts like 'argilaez'
 */

/**
 * Cleans up invalid contexts from localStorage
 * This function can be called from the browser console to fix context issues
 */
export const cleanupInvalidContexts = () => {
  if (typeof window === 'undefined') {
    console.warn('This function can only be run in the browser')
    return
  }

  try {
    const stored = localStorage.getItem('activeFinancialContext')
    
    if (!stored) {
      console.log('No context found in localStorage')
      return
    }

    const context = JSON.parse(stored)
    console.log('Current context in localStorage:', context)

    // Check if context is invalid
    const isInvalid = (
      !context ||
      typeof context !== 'object' ||
      !context.id ||
      !context.name ||
      typeof context.name !== 'string' ||
      context.name.trim() === '' ||
      context.name === 'argilaez'
    )

    if (isInvalid) {
      localStorage.removeItem('activeFinancialContext')
      console.log('✅ Invalid context removed from localStorage')
      console.log('Please refresh the page to load a valid context')
    } else {
      console.log('✅ Context in localStorage is valid')
    }
  } catch (error) {
    console.error('Error cleaning up contexts:', error)
    localStorage.removeItem('activeFinancialContext')
    console.log('✅ Corrupted context data removed from localStorage')
  }
}

/**
 * Clears all financial context data from localStorage
 * Use this as a nuclear option to reset all context data
 */
export const clearAllContextData = () => {
  if (typeof window === 'undefined') {
    console.warn('This function can only be run in the browser')
    return
  }

  localStorage.removeItem('activeFinancialContext')
  console.log('✅ All context data cleared from localStorage')
  console.log('Please refresh the page to load fresh context data')
}

/**
 * Initialize cleanup utilities on the client side
 * This should be called from a client component
 */
export const initializeCleanupUtilities = () => {
  if (typeof window !== 'undefined') {
    // Extend window interface to include our cleanup functions
    const globalWindow = window as typeof window & {
      cleanupInvalidContexts: typeof cleanupInvalidContexts
      clearAllContextData: typeof clearAllContextData
    }
    
    globalWindow.cleanupInvalidContexts = cleanupInvalidContexts
    globalWindow.clearAllContextData = clearAllContextData
    
    console.log('🔧 Context cleanup utilities loaded:')
    console.log('- Run cleanupInvalidContexts() to remove invalid contexts')
    console.log('- Run clearAllContextData() to clear all context data')
  }
}