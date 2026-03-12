import { useCallback } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { ProfileData } from '@/types/student.types'

interface ProfileUpdatePayload {
  name: string
  picture?: string
  role: string
  company?: string
  summary?: string
  email: string
  mediumUsername?: string
  batch: string
  gender?: string
  resumeLink?: string
  skillSets?: string[]
  inspirations?: string[]
  experience?: ProfileData['experience']
  mentorBridgeExp?: ProfileData['mentorBridgeExp']
  socialLinks?: ProfileData['socialLinks']
}

function toSupabasePayload(payload: ProfileUpdatePayload) {
  const batchVal = payload.batch.trim()
  const batchNum = parseInt(batchVal, 10)
  const batch = !Number.isNaN(batchNum) ? batchNum : batchVal

  return {
    name: payload.name.trim(),
    picture: payload.picture?.trim() || null,
    role: payload.role.trim(),
    company: payload.company?.trim() || null,
    summary: payload.summary?.trim() || null,
    email: payload.email.trim(),
    medium_username: payload.mediumUsername?.trim() || null,
    batch,
    gender: (() => {
      const g = payload.gender?.trim().toUpperCase()
      return g === 'M' || g === 'F' ? g : null
    })(),
    resume_link: payload.resumeLink?.trim() || null,
    skill_sets: payload.skillSets ?? null,
    inspirations: payload.inspirations ?? null,
    experience: payload.experience ?? null,
    mentor_bridge_exp: payload.mentorBridgeExp ?? null,
    social_links: payload.socialLinks ?? null,
  }
}

export const useUpdateStudent = () => {
  const updateStudent = useCallback(async (id: string, payload: ProfileUpdatePayload) => {
    const { data, error } = await supabase
      .from('students')
      .update(toSupabasePayload(payload))
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!data) {
      throw new Error(
        'No rows were updated. The student may not exist or you may not have permission to update (check RLS policies).'
      )
    }
  }, [])

  return { updateStudent }
}
