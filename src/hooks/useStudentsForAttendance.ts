'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { StudentForAttendance } from '@/app/modules/Meetings/Meeting.types'

const SELECT_COLS = 'id, name, picture, batch, serial_no'

export interface UseStudentsForAttendanceReturn {
  students: StudentForAttendance[]
  loading: boolean
  error: string | null
  cohort: string
  setCohort: (value: string) => void
  cohortOptions: string[]
  refetch: () => Promise<void>
}

export const useStudentsForAttendance = (): UseStudentsForAttendanceReturn => {
  const [students, setStudents] = useState<StudentForAttendance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cohort, setCohort] = useState('')
  const [cohortOptions, setCohortOptions] = useState<string[]>([])
  const isInitialMount = useRef(true)

  const fetchCohortOptions = useCallback(async () => {
    const { data } = await supabase.from('students').select('batch')
    const cohorts = [
      ...new Set(
        (data ?? [])
          .map((r) => String(r.batch ?? ''))
          .filter(Boolean),
      ),
    ].sort((a, b) => Number(b) - Number(a))
    setCohortOptions(cohorts)
  }, [])

  const fetchStudents = useCallback(async (cohortValue: string) => {
    try {
      setLoading(true)
      setError(null)
      let query = supabase
        .from('students')
        .select(SELECT_COLS)
        .order('serial_no', { ascending: true })
        .order('name', { ascending: true })
      if (cohortValue && cohortValue !== '__all__') {
        query = query.eq('batch', cohortValue)
      }
      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      const transformed: StudentForAttendance[] = (data ?? []).map((s) => ({
        id: s.id,
        name: s.name ?? '',
        picture: s.picture ?? '',
        batch: String(s.batch ?? ''),
        serialNo: Number(s.serial_no) || 0,
      }))
      setStudents(transformed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCohortOptions()
  }, [fetchCohortOptions])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    fetchStudents(cohort)
  }, [cohort, fetchStudents])

  const refetch = useCallback(
    () => fetchStudents(cohort),
    [cohort, fetchStudents],
  )

  return {
    students,
    loading,
    error,
    cohort,
    setCohort,
    cohortOptions,
    refetch,
  }
}
