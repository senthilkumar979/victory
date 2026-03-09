import { useCallback, useContext, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'
import { AppContext } from '../app/contexts/AppContext'

export interface StudentAwardWithCategory extends AwardFormState {
  categoryName?: string
}

const mapRow = (row: Record<string, unknown>): AwardFormState => ({
  id: row.id as string,
  awardedTo: (row.awarded_to as string) ?? '',
  awardedOn: (row.awarded_on as string) ?? '',
  description: (row.description as string) ?? '',
  awardCategoryId: (row.award_category_id as string) ?? '',
})

interface UseStudentAwardsReturn {
  awards: StudentAwardWithCategory[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useStudentAwards = (
  studentEmail?: string | null,
): UseStudentAwardsReturn => {
  const [awards, setAwards] = useState<StudentAwardWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { dispatch } = useContext(AppContext)
  const fetchAwards = useCallback(async () => {
    if (!studentEmail?.trim()) {
      setAwards([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('awards')
        .select(
          'id, awarded_to, awarded_on, description, award_category_id',
        )
        .eq('awarded_to', studentEmail)
        .order('awarded_on', { ascending: false })

      if (fetchError) throw fetchError
      const raw = (data ?? []).map(mapRow)
      const categoryIds = [...new Set(raw.map((a) => a.awardCategoryId).filter(Boolean))]
      let categoryMap: Record<string, string> = {}
      if (categoryIds.length > 0) {
        const { data: catData } = await supabase
          .from('award_categories')
          .select('id, name')
          .in('id', categoryIds)
        categoryMap = Object.fromEntries(
          (catData ?? []).map((c) => [c.id, c.name ?? '']),
        )
      }
      const enriched: StudentAwardWithCategory[] = raw.map((a) => ({
        ...a,
        categoryName: a.awardCategoryId ? categoryMap[a.awardCategoryId] : undefined,
      }))
      setAwards(enriched)
      dispatch({ type: 'SET_AWARDS', payload: enriched })
    } catch (err) {
      console.error('Error fetching student awards:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch awards')
      setAwards([])
    } finally {
      setLoading(false)
    }
  }, [studentEmail, dispatch])

  useEffect(() => {
    void fetchAwards()
  }, [fetchAwards])

  return { awards, loading, error, refetch: fetchAwards }
}
