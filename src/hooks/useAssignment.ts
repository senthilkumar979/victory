'use client'

import { useCallback, useEffect, useState } from 'react'

import type {
  AssignmentListItem,
  AssignmentSubmission,
} from '@/types/assignment.types'

interface UseAssignmentReturn {
  assignment: AssignmentListItem | null
  mySubmission: AssignmentSubmission | null
  submissions: AssignmentSubmission[] | null
  isAdmin: boolean
  canSubmit: boolean
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useAssignment = (id: string): UseAssignmentReturn => {
  const [assignment, setAssignment] = useState<AssignmentListItem | null>(null)
  const [mySubmission, setMySubmission] =
    useState<AssignmentSubmission | null>(null)
  const [submissions, setSubmissions] = useState<AssignmentSubmission[] | null>(
    null,
  )
  const [isAdmin, setIsAdmin] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/assignments/${id}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to load assignment')
      setAssignment(body.assignment ?? null)
      setMySubmission(body.mySubmission ?? null)
      setSubmissions(body.submissions ?? null)
      setIsAdmin(Boolean(body.isAdmin))
      setCanSubmit(Boolean(body.canSubmit))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignment')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    assignment,
    mySubmission,
    submissions,
    isAdmin,
    canSubmit,
    isLoading,
    error,
    refetch,
  }
}
