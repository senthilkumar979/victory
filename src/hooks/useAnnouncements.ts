import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'
import { AnnouncementFormState } from '../app/modules/Announcements/Announcement.types'


interface UseAnnouncementsReturn {
  announcements: AnnouncementFormState[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createAnnouncement: (
    payload: Omit<AnnouncementFormState, 'id' | 'created_at'>,
  ) => Promise<void>
  updateAnnouncement: (
    id: string,
    payload: Omit<AnnouncementFormState, 'id' | 'created_at'>,
  ) => Promise<void>
  deleteAnnouncement: (id: string) => Promise<void>
}

export const useAnnouncements = (): UseAnnouncementsReturn => {
  const [announcements, setAnnouncements] = useState<AnnouncementFormState[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('announcements')
        .select('id, title, description, created_at')
        .order('id', { ascending: false })

      if (fetchError) throw fetchError

      setAnnouncements((data ?? []) as AnnouncementFormState[])
    } catch (err) {
      console.error('Error fetching announcements:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch announcements',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createAnnouncement = useCallback(
    async (payload: Omit<AnnouncementFormState, 'id' | 'created_at'>) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: insertError } = await supabase
          .from('announcements')
          .insert(payload)

        if (insertError) throw insertError

        const broadcastEndpoint = process.env
          .NEXT_PUBLIC_PUSH_BROADCAST_ENDPOINT

        if (broadcastEndpoint) {
          try {
            void fetch(broadcastEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: payload.title,
                body: 'A new announcement has been published.',
                url: '/announcements',
              }),
            })
          } catch (broadcastError) {
            console.error(
              'Error broadcasting announcement push notification:',
              broadcastError,
            )
          }
        }

        await fetchAnnouncements()
      } catch (err) {
        console.error('Error creating announcement:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to create announcement',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [fetchAnnouncements],
  )

  const updateAnnouncement = useCallback(
    async (
      id: string,
      payload: Omit<AnnouncementFormState, 'id' | 'created_at'>,
    ) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: updateError } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', id)

        if (updateError) throw updateError

        await fetchAnnouncements()
      } catch (err) {
        console.error('Error updating announcement:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update announcement',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [fetchAnnouncements],
  )

  const deleteAnnouncement = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: deleteError } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError

        await fetchAnnouncements()
      } catch (err) {
        console.error('Error deleting announcement:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to delete announcement',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [fetchAnnouncements],
  )

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  return {
    announcements,
    isLoading,
    error,
    refetch: fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  }
}

