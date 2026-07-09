'use client'

import { useCallback, useEffect, useState } from 'react'

import type { AssignmentListItem } from '@/types/assignment.types'

interface UseAssignmentsReturn {
  assignments: AssignmentListItem[]
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useAssignments = (): UseAssignmentsReturn => {
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/assignments')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to load assignments')
      setAssignments(body.assignments ?? [])
      setIsAdmin(Boolean(body.isAdmin))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { assignments, isAdmin, isLoading, error, refetch }
}
