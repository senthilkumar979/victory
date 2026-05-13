import 'server-only'

import { cache } from 'react'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabaseClient'

export interface StudentSeoRow {
  id: string
  name: string
  summary: string | null
  picture: string | null
  role: string | null
  company: string | null
  batch: string | null
}

async function fetchStudentForSeoUncached(
  id: string,
): Promise<StudentSeoRow | null> {
  if (!id) return null
  const db = supabaseAdmin ?? supabase
  const { data, error } = await db
    .from('students')
    .select('id, name, summary, picture, role, company, batch')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id as string,
    name: (data.name as string) ?? 'Student',
    summary: (data.summary as string | null) ?? null,
    picture: (data.picture as string | null) ?? null,
    role: (data.role as string | null) ?? null,
    company: (data.company as string | null) ?? null,
    batch: (data.batch as string | null) ?? null,
  }
}

/** Dedupes between `generateMetadata` and the page in the same request. */
export const getStudentForSeo = cache(fetchStudentForSeoUncached)
