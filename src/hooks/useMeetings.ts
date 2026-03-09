import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'
import { toISTTimestamptz } from '@/utils/dateISTUtils'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'

const MEETINGS_TABLE = 'meetings'
const DEFAULT_PAGE_LIMIT = 30
const SELECT_COLS =
  'id, title, date, google_group_id, description, meeting_link, cover_image_url'

interface UseMeetingsOptions {
  page?: number
  pageLimit?: number
}

interface UseMeetingsReturn {
  meetings: MeetingFormState[]
  totalCount: number
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
    date: toISTTimestamptz(form.date),
    google_group_id: form.googleGroupId,
    description: form.description,
    meeting_link: form.meetingLink,
    cover_image_url: form.coverImageUrl,
  }
}

export const useMeetings = (
  options: UseMeetingsOptions = {},
): UseMeetingsReturn => {
  const { page = 1, pageLimit } = options
  const usePagination = pageLimit != null && pageLimit > 0

  const [meetings, setMeetings] = useState<MeetingFormState[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const query = supabase
        .from(MEETINGS_TABLE)
        .select(SELECT_COLS, usePagination ? { count: 'exact' } : undefined)
        .order('date', { ascending: false })

      const from = (page - 1) * (pageLimit ?? DEFAULT_PAGE_LIMIT)
      const to = from + (pageLimit ?? DEFAULT_PAGE_LIMIT) - 1
      const paginatedQuery = usePagination ? query.range(from, to) : query

      const { data, count, error: fetchError } = await paginatedQuery

      if (fetchError) throw fetchError
      const rows = (data ?? []).map(mapRow)
      setMeetings(rows)
      setTotalCount(usePagination ? (count ?? 0) : rows.length)
    } catch (err) {
      console.error('Error fetching meetings:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch meetings',
      )
    } finally {
      setIsLoading(false)
    }
  }, [page, pageLimit, usePagination])

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
    totalCount,
    isLoading,
    error,
    refetch: fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  }
}
