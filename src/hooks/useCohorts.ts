'use client'

import { useCallback, useEffect, useState } from 'react'

import type { Cohort } from '@/types/assignment.types'

export const useCohorts = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/cohorts')
      const body = await res.json()
      if (res.ok) setCohorts(body.cohorts ?? [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { cohorts, isLoading, refetch }
}
