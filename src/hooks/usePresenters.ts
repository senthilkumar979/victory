import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { PresenterFormState } from '@/app/modules/Presenters/Presenter.types'

const PRESENTERS_TABLE = 'presenters'
const SELECT_COLS = 'id, presented_by, presented_date, topic'

interface UsePresentersReturn {
  presenters: PresenterFormState[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createPresenter: (
    payload: Omit<PresenterFormState, 'id'>,
  ) => Promise<{ id: string }>
  updatePresenter: (
    id: string,
    payload: Omit<PresenterFormState, 'id'>,
  ) => Promise<void>
  deletePresenter: (id: string) => Promise<void>
}

function mapRow(row: Record<string, unknown>): PresenterFormState {
  return {
    id: row.id as string,
    presentedBy: (row.presented_by as string) ?? '',
    presentedDate: (row.presented_date as string) ?? '',
    topic: (row.topic as string) ?? '',
  }
}

function toPayload(form: Omit<PresenterFormState, 'id'>) {
  return {
    presented_by: form.presentedBy,
    presented_date: form.presentedDate,
    topic: form.topic,
  }
}

export const usePresenters = (): UsePresentersReturn => {
  const [presenters, setPresenters] = useState<PresenterFormState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPresenters = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from(PRESENTERS_TABLE)
        .select(SELECT_COLS)
        .order('presented_date', { ascending: false })

      if (fetchError) throw fetchError
      const presentersRaw = (data ?? []).map(mapRow)
      if (presentersRaw.length === 0) {
        setPresenters([])
        return
      }

      const emails = [
        ...new Set(
          presentersRaw.map((a) => a.presentedBy).filter(Boolean),
        ),
      ] as string[]
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

      const enriched: PresenterFormState[] = presentersRaw.map((presenter) => {
        const student = studentByEmail.get(presenter.presentedBy)
        return { ...presenter, student: student ?? undefined }
      })
      setPresenters(enriched)
    } catch (err) {
      console.error('Error fetching presenters:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch presenters',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createPresenter = useCallback(
    async (
      payload: Omit<PresenterFormState, 'id'>,
    ): Promise<{ id: string }> => {
      const { data, error: insertError } = await supabase
        .from(PRESENTERS_TABLE)
        .insert(toPayload(payload))
        .select('id')
        .single()
      if (insertError) throw insertError
      if (!data?.id) throw new Error('Presenter created but no id returned')
      await fetchPresenters()
      return { id: data.id }
    },
    [fetchPresenters],
  )

  const updatePresenter = useCallback(
    async (id: string, payload: Omit<PresenterFormState, 'id'>) => {
      const { error: updateError } = await supabase
        .from(PRESENTERS_TABLE)
        .update(toPayload(payload))
        .eq('id', id)
      if (updateError) throw updateError
      await fetchPresenters()
    },
    [fetchPresenters],
  )

  const deletePresenter = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase
        .from(PRESENTERS_TABLE)
        .delete()
        .eq('id', id)
      if (deleteError) throw deleteError
      await fetchPresenters()
    },
    [fetchPresenters],
  )

  useEffect(() => {
    fetchPresenters()
  }, [fetchPresenters])

  return {
    presenters,
    isLoading,
    error,
    refetch: fetchPresenters,
    createPresenter,
    updatePresenter,
    deletePresenter,
  }
}
