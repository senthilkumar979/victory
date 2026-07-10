'use client'

import { useCallback, useEffect, useState } from 'react'

import type { AssignmentListItem, AssignmentSubmission } from '@/types/assignment.types'

export function useMemberDashboardAssignments() {
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([])
  const [submissions, setSubmissions] = useState<
    Record<string, AssignmentSubmission | null>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/assignments')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to load assignments')

      const list: AssignmentListItem[] = body.assignments ?? []
      setAssignments(list)

      if (body.isAdmin) {
        setSubmissions({})
        return
      }

      const pairs = await Promise.all(
        list.map(async (a) => {
          const subRes = await fetch(`/api/assignments/${a.id}`)
          const subBody = await subRes.json()
          return [a.id, subBody.mySubmission ?? null] as const
        }),
      )
      setSubmissions(Object.fromEntries(pairs))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { assignments, submissions, isLoading, error, refetch }
}
