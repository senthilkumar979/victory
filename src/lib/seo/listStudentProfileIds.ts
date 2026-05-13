import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabaseClient'

const MAX_SITEMAP_STUDENTS = 5000

/** Public student profile URLs for `sitemap.xml` (build / ISR). */
export async function listStudentProfileIds(): Promise<string[]> {
  const db = supabaseAdmin ?? supabase
  const { data, error } = await db
    .from('students')
    .select('id')
    .order('id', { ascending: true })
    .limit(MAX_SITEMAP_STUDENTS)

  if (error || !data?.length) return []
  return data
    .map((r: { id: string | null }) => r.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
}
