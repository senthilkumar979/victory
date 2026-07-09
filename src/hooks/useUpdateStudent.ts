import { useCallback } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { ProfileData } from '@/types/student.types'

export interface ProfileUpdatePayload {
  id?: string
  name: string
  picture?: string
  role: string
  company?: string
  summary?: string
  email: string
  mediumUsername?: string
  cohortId: string
  gender?: string
  resumeLink?: string
  skillSets?: string[]
  inspirations?: string[]
  experience?: ProfileData['experience']
  mentorBridgeExp?: ProfileData['mentorBridgeExp']
  socialLinks?: ProfileData['socialLinks']
  fatherGuardianDetails?: string
  motherDetails?: string
}

export function toSupabasePayload(payload: ProfileUpdatePayload) {
  const row: Record<string, unknown> = {
    id: payload.id?.trim() ?? null,
    name: payload.name.trim(),
    picture: payload.picture?.trim() || null,
    role: payload.role.trim(),
    company: payload.company?.trim() || null,
    summary: payload.summary?.trim() || null,
    email: payload.email.trim(),
    medium_username: payload.mediumUsername?.trim() || null,
    cohort_id: payload.cohortId,
    gender: (() => {
      const g = payload.gender?.trim().toUpperCase()
      return g === 'M' || g === 'F' ? g : null
    })(),
    resume_link: payload.resumeLink?.trim() || null,
    skill_sets: payload.skillSets ?? null,
    inspirations: payload.inspirations ?? null,
    experience: payload.experience ?? null,
    mentor_bridge_exp: payload.mentorBridgeExp ?? null,
    social_links:
      payload.socialLinks !== undefined
        ? {
            linkedIn: payload.socialLinks.linkedIn?.trim() ?? '',
            gitHub: payload.socialLinks.gitHub?.trim() ?? '',
            website: payload.socialLinks?.website?.trim() ?? '',
          }
        : null,
  }

  if (payload.fatherGuardianDetails !== undefined) {
    row.father_guardian_details = payload.fatherGuardianDetails.trim() || null
  }
  if (payload.motherDetails !== undefined) {
    row.mother_details = payload.motherDetails.trim() || null
  }

  return row
}

export const useUpdateStudent = () => {
  const updateStudent = useCallback(async (id: string, payload: ProfileUpdatePayload) => {
    payload.id = id.trim();
    const { data, error } = await supabase
      .from('students')
      .update(toSupabasePayload(payload))
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Error updating student:', error)
      throw error
    }
    if (!data) {
      throw new Error(
        'No rows were updated. The student may not exist or you may not have permission to update (check RLS policies).'
      )
    }
  }, [])

  return { updateStudent }
}
