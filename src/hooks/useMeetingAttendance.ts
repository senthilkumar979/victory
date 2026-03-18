'use client'

import { useCallback, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

const MEETINGS_TABLE = 'meetings'

export interface UseMeetingAttendanceReturn {
  attendance: number[]
  loading: boolean
  error: string | null
  fetchAttendance: (meetingId: string) => Promise<number[]>
  updateAttendance: (meetingId: string, attendance: number[]) => Promise<void>
}

export const useMeetingAttendance = (isHideAttendance?: boolean): UseMeetingAttendanceReturn => {
  const [attendance, setAttendance] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = useCallback(async (meetingId: string): Promise<number[]> => {
    if (!meetingId || isHideAttendance) return []
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from(MEETINGS_TABLE)
        .select('attendance')
        .eq('id', meetingId)
        .single()
      if (fetchError) throw fetchError
      const arr = (data?.attendance ?? []) as unknown[]
      const sorted = arr.map((n) => Number(n)).sort((a, b) => a - b)
      setAttendance(sorted)
      return sorted
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAttendance = useCallback(
    async (meetingId: string, payload: number[]) => {
      try {
        setLoading(true)
        setError(null)
        const { error: updateError } = await supabase
          .from(MEETINGS_TABLE)
          .update({ attendance: payload })
          .eq('id', meetingId)
        if (updateError) throw updateError
        setAttendance([...payload].sort((a, b) => a - b))
      } catch (err) {
        console.error('Error updating attendance:', err);
        setError(err instanceof Error ? err.message : 'Failed to update attendance')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    attendance,
    loading,
    error,
    fetchAttendance,
    updateAttendance,
  }
}
