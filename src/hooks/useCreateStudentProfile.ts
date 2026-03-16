import { useCallback } from 'react'
import uuid from 'react-uuid'

import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'

import { supabase } from '../lib/supabaseClient'
import { ProfileUpdatePayload, toSupabasePayload } from './useUpdateStudent'

export const useCreateStudentProfile = () => {
  const createStudentProfile = useCallback(
    async (payload: ProfileUpdatePayload) => {
      const { data: existing, error: checkError } = await supabase
        .from('students')
        .select('id')
        .eq('email', payload.email.trim())
        .maybeSingle()

      if (checkError) throw checkError
      if (existing) {
        throw new Error('A student with this email already exists.')
      }

      payload.id = uuid()
      const { data, error } = await supabase
        .from('students')
        .insert(toSupabasePayload(payload))
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!data) {
        throw new Error(
          'No rows were inserted. The student may not exist or you may not have permission to insert (check RLS policies).',
        )
      }

      const templateId = RESEND_TEMPLATE_IDS.STUDENT_PROFILE_CREATED
      if (templateId?.trim()) {
        try {
          await fetch('/api/email/send-with-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: payload.email.trim(),
              templateId,
              variables: {
                student_name: payload.name,
                student_email: payload.email.trim(),
              },
            }),
          })
        } catch (err) {
          console.error('Failed to send student profile email', err)
        }
      }

      return data
    },
    [],
  )

  return { createStudentProfile }
}