'use client'

import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { StudentForAttendance } from '@/app/modules/Meetings/Meeting.types'

const SELECT_COLS = 'id, name, picture, batch, serial_no'

export interface UseStudentsBySerialNumbersReturn {
  students: StudentForAttendance[]
  loading: boolean
  error: string | null
  fetchStudents: (serialNumbers: number[]) => Promise<void>
}

export const useStudentsBySerialNumbers =
  (): UseStudentsBySerialNumbersReturn => {
    const [students, setStudents] = useState<StudentForAttendance[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchStudents = useCallback(async (serialNumbers: number[]) => {
      const validSerialNos = serialNumbers.filter((n) => n > 0)
      if (validSerialNos.length === 0) {
        setStudents([])
        setError(null)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const { data, error: fetchError } = await supabase
          .from('students')
          .select(SELECT_COLS)
          .in('serial_no', validSerialNos)
          .order('serial_no', { ascending: true })

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
        setError(
          err instanceof Error ? err.message : 'Failed to fetch students',
        )
        setStudents([])
      } finally {
        setLoading(false)
      }
    }, [])

    return { students, loading, error, fetchStudents }
  }
