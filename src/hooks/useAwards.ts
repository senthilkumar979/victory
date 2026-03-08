import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'

const AWARDS_TABLE = 'awards'
const SELECT_COLS =
  'id, awarded_to, awarded_on, description, award_category_id'

interface UseAwardsReturn {
  awards: AwardFormState[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createAward: (
    payload: Omit<AwardFormState, 'id'>,
  ) => Promise<{ id: string }>
  updateAward: (
    id: string,
    payload: Omit<AwardFormState, 'id'>,
  ) => Promise<void>
  deleteAward: (id: string) => Promise<void>
}

function mapRow(row: Record<string, unknown>): AwardFormState {
  return {
    id: row.id as string,
    awardedTo: (row.awarded_to as string) ?? '',
    awardedOn: (row.awarded_on as string) ?? '',
    description: (row.description as string) ?? '',
    awardCategoryId: (row.award_category_id as string) ?? '',
  }
}

function toPayload(form: Omit<AwardFormState, 'id'>) {
  return {
    awarded_to: form.awardedTo,
    awarded_on: form.awardedOn,
    description: form.description,
    award_category_id: form.awardCategoryId || null,
  }
}

export const useAwards = (): UseAwardsReturn => {
  const [awards, setAwards] = useState<AwardFormState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAwards = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from(AWARDS_TABLE)
        .select(SELECT_COLS)
        .order('awarded_on', { ascending: false })

      if (fetchError) throw fetchError
      const awardsRaw = (data ?? []).map(mapRow)
      if (awardsRaw.length === 0) {
        setAwards([])
        return
      }

      const emails = [...new Set(awardsRaw.map((a) => a.awardedTo).filter(Boolean))]
      const { data: studentsData } = await supabase
        .from('students')
        .select('email, name, picture, batch')
        .in('email', emails)

      const studentByEmail = new Map(
        (studentsData ?? []).map((s) => [
          s.email,
          {
            name: s.name ?? '',
            picture: s.picture ?? '',
            batch: s.batch ?? '',
          },
        ]),
      )

      const enriched: AwardFormState[] = awardsRaw.map((award) => {
        const student = studentByEmail.get(award.awardedTo)
        return { ...award, student: student ?? undefined }
      })
      setAwards(enriched)
    } catch (err) {
      console.error('Error fetching awards:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch awards',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createAward = useCallback(
    async (payload: Omit<AwardFormState, 'id'>): Promise<{ id: string }> => {
      const { data, error: insertError } = await supabase
        .from(AWARDS_TABLE)
        .insert(toPayload(payload))
        .select('id')
        .single()
      if (insertError) throw insertError
      if (!data?.id) throw new Error('Award created but no id returned')
      await fetchAwards()
      return { id: data.id }
    },
    [fetchAwards],
  )

  const updateAward = useCallback(
    async (id: string, payload: Omit<AwardFormState, 'id'>) => {
      const { error: updateError } = await supabase
        .from(AWARDS_TABLE)
        .update(toPayload(payload))
        .eq('id', id)
      if (updateError) throw updateError
      await fetchAwards()
    },
    [fetchAwards],
  )

  const deleteAward = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase
        .from(AWARDS_TABLE)
        .delete()
        .eq('id', id)
      if (deleteError) throw deleteError
      await fetchAwards()
    },
    [fetchAwards],
  )

  useEffect(() => {
    fetchAwards()
  }, [fetchAwards])

  return {
    awards,
    isLoading,
    error,
    refetch: fetchAwards,
    createAward,
    updateAward,
    deleteAward,
  }
}
