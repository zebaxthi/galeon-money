import { useState, useEffect } from 'react'
import { MovementService } from '@/lib/services/movements'
import type { Movement, CreateMovementData } from '@/lib/types'

export function useMovements(contextId?: string, limit?: number) {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMovements = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await MovementService.getMovements(contextId, limit)
      setMovements(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading movements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMovements()
  }, [contextId, limit])

  const createMovement = async (movementData: CreateMovementData) => {
    try {
      setError(null)
      const newMovement = await MovementService.createMovement(movementData)
      setMovements(prev => [newMovement, ...prev])
      return newMovement
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating movement')
      throw err
    }
  }

  const updateMovement = async (id: string, updates: Partial<CreateMovementData>) => {
    try {
      setError(null)
      const updatedMovement = await MovementService.updateMovement(id, updates)
      setMovements(prev => prev.map(m => m.id === id ? updatedMovement : m))
      return updatedMovement
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating movement')
      throw err
    }
  }

  const deleteMovement = async (id: string) => {
    try {
      setError(null)
      await MovementService.deleteMovement(id)
      setMovements(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting movement')
      throw err
    }
  }

  return {
    movements,
    loading,
    error,
    createMovement,
    updateMovement,
    deleteMovement,
    refetch: loadMovements
  }
}

export function useMovementStats(contextId?: string) {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    movementsCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await MovementService.getMovementStats(contextId)
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading stats')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [contextId])

  return { stats, loading, error }
}