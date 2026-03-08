import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { PartnerFormState } from '@/app/modules/Partners/Partner.types'

const PARTNERS_TABLE = 'partners'
const SELECT_COLS =
  'id, name, company, location, primary_email, primary_contact, secondary_email, secondary_contact, designation, description'

interface UsePartnersReturn {
  partners: PartnerFormState[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createPartner: (
    payload: Omit<PartnerFormState, 'id'>,
  ) => Promise<{ id: string }>
  updatePartner: (
    id: string,
    payload: Omit<PartnerFormState, 'id'>,
  ) => Promise<void>
  deletePartner: (id: string) => Promise<void>
}

function mapRow(row: Record<string, unknown>): PartnerFormState {
  return {
    id: row.id as string,
    name: (row.name as string) ?? '',
    company: (row.company as string) ?? '',
    location: (row.location as string) ?? '',
    primaryEmail: (row.primary_email as string) ?? '',
    primaryContact: (row.primary_contact as string) ?? '',
    secondaryEmail: (row.secondary_email as string) ?? '',
    secondaryContact: (row.secondary_contact as string) ?? '',
    designation: (row.designation as string) ?? '',
    description: (row.description as string) ?? '',
  }
}

function toPayload(form: Omit<PartnerFormState, 'id'>) {
  return {
    name: form.name.trim(),
    company: form.company.trim(),
    location: form.location.trim(),
    primary_email: form.primaryEmail?.trim() || null,
    primary_contact: form.primaryContact?.trim() || null,
    secondary_email: form.secondaryEmail?.trim() || null,
    secondary_contact: form.secondaryContact?.trim() || null,
    designation: form.designation?.trim() || null,
    description: form.description?.trim() || null,
  }
}

export const usePartners = (): UsePartnersReturn => {
  const [partners, setPartners] = useState<PartnerFormState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPartners = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from(PARTNERS_TABLE)
        .select(SELECT_COLS)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      setPartners((data ?? []).map(mapRow))
    } catch (err) {
      console.error('Error fetching partners:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch partners',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createPartner = useCallback(
    async (payload: Omit<PartnerFormState, 'id'>): Promise<{ id: string }> => {
      const { data, error: insertError } = await supabase
        .from(PARTNERS_TABLE)
        .insert(toPayload(payload))
        .select('id')
        .single()
      if (insertError) throw insertError
      if (!data?.id) throw new Error('Partner created but no id returned')
      await fetchPartners()
      return { id: data.id }
    },
    [fetchPartners],
  )

  const updatePartner = useCallback(
    async (id: string, payload: Omit<PartnerFormState, 'id'>) => {
      const { error: updateError } = await supabase
        .from(PARTNERS_TABLE)
        .update(toPayload(payload))
        .eq('id', id)
      if (updateError) throw updateError
      await fetchPartners()
    },
    [fetchPartners],
  )

  const deletePartner = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase
        .from(PARTNERS_TABLE)
        .delete()
        .eq('id', id)
      if (deleteError) throw deleteError
      await fetchPartners()
    },
    [fetchPartners],
  )

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  return {
    partners,
    isLoading,
    error,
    refetch: fetchPartners,
    createPartner,
    updatePartner,
    deletePartner,
  }
}
