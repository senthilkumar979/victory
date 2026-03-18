import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'

const MEETINGS_TABLE = 'meetings'
const SELECT_COLS =
  'id, title, date, google_group_id, description, meeting_link, cover_image_url, feedback_form'

function mapRow(row: Record<string, unknown>): MeetingFormState {
  return {
    id: row.id as string,
    title: (row.title as string) ?? '',
    date: (row.date as string) ?? '',
    googleGroupId: (row.google_group_id as string) ?? '',
    description: (row.description as string) ?? '',
    meetingLink: (row.meeting_link as string) ?? '',
    coverImageUrl: (row.cover_image_url as string) ?? '',
    feedbackForm: (row.feedback_form as string) ?? undefined,
  }
}

export const useFetchParticipationsByUser = (serialNo: number | undefined) => {
  const [participations, setParticipations] = useState<MeetingFormState[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchParticipations = useCallback(async () => {
    if (serialNo == null || serialNo <= 0) {
      setParticipations([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from(MEETINGS_TABLE)
        .select(SELECT_COLS)
        .contains('attendance', [serialNo])
        .order('date', { ascending: false })

      if (fetchError) {
        console.error('Error fetching participations:', fetchError)
        throw fetchError
      }

      const meetings = (data ?? []).map((row) =>
        mapRow(row as Record<string, unknown>),
      )
      setParticipations(meetings)
    } catch (err) {
      console.error('Error fetching participations:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to load participations',
      )
      setParticipations([])
    } finally {
      setIsLoading(false)
    }
  }, [serialNo])

  useEffect(() => {
    fetchParticipations()
  }, [fetchParticipations])

  return { participations, isLoading, error, refetch: fetchParticipations }
}
