import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { HallOfFameEntry } from '../app/modules/HallOfFame/HallOfFame.types'

interface UseHallOfFameReturn {
  entries: HallOfFameEntry[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createEntry: (payload: Omit<HallOfFameEntry, 'id' | 'created_at'>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
}

export const useHallOfFame = (): UseHallOfFameReturn => {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: hofData, error: fetchError } = await supabase
        .from('hall_of_fame')
        .select('id, student_email, date_of_induction, created_at')
        .order('date_of_induction', { ascending: false })

      if (fetchError) throw fetchError

      const entriesRaw = (hofData ?? []) as HallOfFameEntry[]
      if (entriesRaw.length === 0) {
        setEntries([])
        return
      }

      const emails = [...new Set(entriesRaw.map((e) => e.student_email))]
      const { data: studentsData } = await supabase
        .from('students')
        .select('email, name, picture, batch')
        .in('email', emails)

      const studentByEmail = new Map(
        (studentsData ?? []).map((s) => [
          s.email,
          { name: s.name, picture: s.picture, batch: s.batch },
        ]),
      )

      const enriched: HallOfFameEntry[] = entriesRaw.map((entry) => {
        const student = studentByEmail.get(entry.student_email)
        return {
          ...entry,
          student: student ?? undefined,
        }
      })

      setEntries(enriched)
    } catch (err) {
      console.error('Error fetching hall of fame:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch hall of fame entries',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createEntry = useCallback(
    async (payload: Omit<HallOfFameEntry, 'id' | 'created_at'>) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: insertError } = await supabase
          .from('hall_of_fame')
          .insert({
            student_email: payload.student_email,
            date_of_induction: payload.date_of_induction,
          })

        if (insertError) throw insertError

        await fetchEntries()
      } catch (err) {
        console.error('Error creating hall of fame entry:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to create hall of fame entry',
        )
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchEntries],
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: deleteError } = await supabase
          .from('hall_of_fame')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError

        await fetchEntries()
      } catch (err) {
        console.error('Error deleting hall of fame entry:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to delete hall of fame entry',
        )
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchEntries],
  )

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return {
    entries,
    isLoading,
    error,
    refetch: fetchEntries,
    createEntry,
    deleteEntry,
  }
}
