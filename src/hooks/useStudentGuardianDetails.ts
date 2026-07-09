'use client'

import { useEffect, useState } from 'react'

export interface GuardianDetails {
  fatherGuardianDetails: string
  motherDetails: string
}

export const useStudentGuardianDetails = (
  studentId: string,
  enabled: boolean,
) => {
  const [guardianDetails, setGuardianDetails] = useState<
    GuardianDetails | null | undefined
  >(undefined)

  useEffect(() => {
    if (!enabled || !studentId) {
      setGuardianDetails(undefined)
      return
    }

    let cancelled = false
    fetch(`/api/students/${studentId}/guardian-details`)
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return
        if (body.error) {
          setGuardianDetails(null)
          return
        }
        setGuardianDetails({
          fatherGuardianDetails: body.fatherGuardianDetails ?? '',
          motherDetails: body.motherDetails ?? '',
        })
      })
      .catch(() => {
        if (!cancelled) setGuardianDetails(null)
      })

    return () => {
      cancelled = true
    }
  }, [enabled, studentId])

  return guardianDetails
}
