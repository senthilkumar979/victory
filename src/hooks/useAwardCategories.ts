import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

interface AwardCategory {
  id?: string
  name: string
}

interface UseAwardCategoriesReturn {
  categories: AwardCategory[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCategory: (payload: Omit<AwardCategory, 'id'>) => Promise<void>
  updateCategory: (id: string, payload: Omit<AwardCategory, 'id'>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export const useAwardCategories = (): UseAwardCategoriesReturn => {
  const [categories, setCategories] = useState<AwardCategory[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('award_categories')
        .select('id, name')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      setCategories((data ?? []) as AwardCategory[])
    } catch (err) {
      console.error('Error fetching award categories:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch award categories',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createCategory = useCallback(
    async (payload: Omit<AwardCategory, 'id'>) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: insertError } = await supabase
          .from('award_categories')
          .insert(payload)

        if (insertError) throw insertError

        await fetchCategories()
      } catch (err) {
        console.error('Error creating award category:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to create award category',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCategories],
  )

  const updateCategory = useCallback(
    async (id: string, payload: Omit<AwardCategory, 'id'>) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: updateError } = await supabase
          .from('award_categories')
          .update(payload)
          .eq('id', id)

        if (updateError) throw updateError

        await fetchCategories()
      } catch (err) {
        console.error('Error updating award category:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update award category',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCategories],
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const { error: deleteError } = await supabase
          .from('award_categories')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError

        await fetchCategories()
      } catch (err) {
        console.error('Error deleting award category:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to delete award category',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCategories],
  )

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
