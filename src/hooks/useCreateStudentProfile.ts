import { useCallback } from "react"
import uuid from "react-uuid"
import { supabase } from "../lib/supabaseClient"
import { ProfileUpdatePayload, toSupabasePayload } from "./useUpdateStudent"

export const useCreateStudentProfile = () => {
  const createStudentProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    // Ensure email does not already exist in the students table before inserting
    const { data: existing, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('email', payload.email.trim())
      .maybeSingle();

    if (checkError) {
      console.log('checkError', checkError)
      throw checkError;
    }
    if (existing) {
      console.log('existing', existing)
      throw new Error('A student with this email already exists.');
    }

    payload.id = uuid();
    const { data, error } = await supabase
      .from('students')
      .insert(toSupabasePayload(payload))
      .select('id')
      .maybeSingle();

    if (error) {
      console.log('error', error)
      throw error
    }
    if (!data) {
      console.log('data', data)
      throw new Error('No rows were inserted. The student may not exist or you may not have permission to insert (check RLS policies).')
    }

    return data
  }, [])

  return { createStudentProfile }
}