import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

interface GoogleGroup {
  id?: string
  name: string
  email: string
}

interface UseGoogleGroupsReturn {
  groups: GoogleGroup[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createGroup: (payload: Omit<GoogleGroup, 'id'>) => Promise<void>
  updateGroup: (id: string, payload: Omit<GoogleGroup, 'id'>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
}

export const useGoogleGroups = (): UseGoogleGroupsReturn => {
  const [groups, setGroups] = useState<GoogleGroup[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('google_groups')
        .select('id, name, email')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      setGroups((data ?? []) as GoogleGroup[])
    } catch (err) {
      console.error('Error fetching Google groups:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch Google groups',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createGroup = useCallback(
    async (payload: Omit<GoogleGroup, 'id'>) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: insertError } = await supabase
          .from('google_groups')
          .insert(payload)

        if (insertError) throw insertError

        await fetchGroups()
      } catch (err) {
        console.error('Error creating Google group:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to create Google group',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [fetchGroups],
  )

  const updateGroup = useCallback(
    async (id: string, payload: Omit<GoogleGroup, 'id'>) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: updateError } = await supabase
          .from('google_groups')
          .update(payload)
          .eq('id', id)

        if (updateError) throw updateError

        await fetchGroups()
      } catch (err) {
        console.error('Error updating Google group:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to update Google group',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [fetchGroups],
  )

  const deleteGroup = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: deleteError } = await supabase
          .from('google_groups')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError

        await fetchGroups()
      } catch (err) {
        console.error('Error deleting Google group:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to delete Google group',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [fetchGroups],
  )

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return {
    groups,
    isLoading,
    error,
    refetch: fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  }
}

