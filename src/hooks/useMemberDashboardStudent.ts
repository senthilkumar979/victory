'use client'

import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'

import { mapSupabaseStudentRowToProfile } from '@/lib/mapSupabaseStudentRowToProfile'
import { supabase } from '@/lib/supabaseClient'
import type { ProfileData } from '@/types/student.types'

function getPrimaryEmail(
  user: ReturnType<typeof useUser>['user'] | null,
): string | null {
  if (!user) return null
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null
}

export interface UseMemberDashboardStudentReturn {
  profile: ProfileData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useMemberDashboardStudent(): UseMemberDashboardStudentReturn {
  const { user } = useUser()
  const email = getPrimaryEmail(user ?? null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!email) {
      setProfile(null)
      setIsLoading(false)
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .maybeSingle()
      if (fetchError) throw fetchError
      if (!data?.name) {
        setProfile(null)
        return
      }
      setProfile(mapSupabaseStudentRowToProfile(data as Record<string, unknown>))
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Failed to load profile')
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [email])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { profile, isLoading, error, refetch }
}
