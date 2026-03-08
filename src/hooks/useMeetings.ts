import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'

const MEETINGS_TABLE = 'meetings'
const SELECT_COLS =
  'id, title, date, google_group_id, description, meeting_link, cover_image_url'

interface UseMeetingsReturn {
  meetings: MeetingFormState[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createMeeting: (
    payload: Omit<MeetingFormState, 'id'>,
  ) => Promise<{ id: string }>
  updateMeeting: (
    id: string,
    payload: Omit<MeetingFormState, 'id'>,
  ) => Promise<void>
  deleteMeeting: (id: string) => Promise<void>
}

function mapRow(row: Record<string, unknown>): MeetingFormState {
  return {
    id: row.id as string,
    title: (row.title as string) ?? '',
    date: (row.date as string) ?? '',
    googleGroupId: (row.google_group_id as string) ?? '',
    description: (row.description as string) ?? '',
    meetingLink: (row.meeting_link as string) ?? '',
    coverImageUrl: (row.cover_image_url as string) ?? '',
  }
}

function toPayload(form: Omit<MeetingFormState, 'id'>) {
  return {
    title: form.title,
    date: form.date,
    google_group_id: form.googleGroupId,
    description: form.description,
    meeting_link: form.meetingLink,
    cover_image_url: form.coverImageUrl,
  }
}

export const useMeetings = (): UseMeetingsReturn => {
  const [meetings, setMeetings] = useState<MeetingFormState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from(MEETINGS_TABLE)
        .select(SELECT_COLS)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError
      setMeetings((data ?? []).map(mapRow))
    } catch (err) {
      console.error('Error fetching meetings:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch meetings',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createMeeting = useCallback(
    async (payload: Omit<MeetingFormState, 'id'>): Promise<{ id: string }> => {
      const { data, error: insertError } = await supabase
        .from(MEETINGS_TABLE)
        .insert(toPayload(payload))
        .select('id')
        .single()
      if (insertError) throw insertError
      if (!data?.id) throw new Error('Meeting created but no id returned')
      await fetchMeetings()
      return { id: data.id }
    },
    [fetchMeetings],
  )

  const updateMeeting = useCallback(
    async (id: string, payload: Omit<MeetingFormState, 'id'>) => {
      const { error: updateError } = await supabase
        .from(MEETINGS_TABLE)
        .update(toPayload(payload))
        .eq('id', id)
      if (updateError) throw updateError
      await fetchMeetings()
    },
    [fetchMeetings],
  )

  const deleteMeeting = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase
        .from(MEETINGS_TABLE)
        .delete()
        .eq('id', id)
      if (deleteError) throw deleteError
      await fetchMeetings()
    },
    [fetchMeetings],
  )

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  return {
    meetings,
    isLoading,
    error,
    refetch: fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  }
}
