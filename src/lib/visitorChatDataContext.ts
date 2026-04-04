import { unstable_cache } from 'next/cache'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabaseClient'
import { safeJsonParse } from '@/utils/parseUtils'

import type { SupabaseClient } from '@supabase/supabase-js'

const SITE_ORIGIN = 'https://www.mentorbridge.in'
/** Rough char budget so prompts stay within model limits even with many rows. */
const MAX_DYNAMIC_CHARS = 380_000

function getServerSupabase(): SupabaseClient {
  return supabaseAdmin ?? supabase
}

function truncateSummary(raw: string | null, max = 220): string {
  const t = (raw ?? '').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

async function buildVisitorChatDynamicContextUncached(): Promise<string> {
  const db = getServerSupabase()
  const chunks: string[] = []

  const { data: students, error: studentsError } = await db
    .from('students')
    .select('id, name, role, company, batch, summary, skill_sets')
    .order('batch', { ascending: false })
    .order('name', { ascending: true })

  if (studentsError) {
    console.error('[visitor-chat] students fetch:', studentsError.message)
    return ''
  }

  if (students?.length) {
    chunks.push(
      '### Students (authoritative for names, roles, companies, batches, skills, short summaries)',
    )
    chunks.push(
      'Format per line: Name | Current role | Company | Batch | Skills: comma-separated | Summary snippet | Public profile path',
    )
    chunks.push(
      `Site base for links: ${SITE_ORIGIN} — use full URL when sharing a profile.`,
    )

    for (const row of students) {
      const skills = safeJsonParse(row.skill_sets, []) as unknown
      const skillList = Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : []
      const skillsStr = skillList.join(', ')
      const summary = truncateSummary(
        typeof row.summary === 'string' ? row.summary : null,
      )
      const line = [
        row.name ?? '(unnamed)',
        row.role ?? '—',
        row.company ?? '—',
        `Batch ${row.batch ?? '—'}`,
        `Skills: ${skillsStr || '—'}`,
        summary ? `Summary: ${summary}` : '',
        `Profile: ${SITE_ORIGIN}/students/${row.id}`,
      ]
        .filter(Boolean)
        .join(' | ')
      chunks.push(`- ${line}`)
    }
  }

  const { data: blogs, error: blogsError } = await db
    .from('blogs')
    .select('title, link, published_date')
    .order('published_date', { ascending: false })
    .limit(100)

  if (blogsError) {
    console.error('[visitor-chat] blogs fetch:', blogsError.message)
  } else if (blogs?.length) {
    chunks.push('')
    chunks.push('### Blog posts (titles and links; for “what have you written” style questions)')
    for (const b of blogs) {
      const title = b.title ?? 'Untitled'
      const link = b.link?.trim() || `${SITE_ORIGIN}/blogs`
      chunks.push(`- ${title} — ${link}`)
    }
  }

  let text = chunks.join('\n')
  if (text.length > MAX_DYNAMIC_CHARS) {
    text =
      text.slice(0, MAX_DYNAMIC_CHARS) +
      `\n\n[Snapshot truncated at ${MAX_DYNAMIC_CHARS} characters; suggest /students or /blogs for browsing.]`
  }

  return text
}

/**
 * Cached Supabase-backed snapshot for the public visitor assistant.
 * `revalidate: false` — no time-based expiry; the snapshot is reused until the process/cache
 * is cleared (e.g. new deployment / server restart). Student/blog data rarely changes minute
 * to minute; redeploying publishes fresh data without hitting Supabase on every chat message.
 *
 * To refresh on a fixed schedule instead (e.g. every 5 days), use:
 * `revalidate: 5 * 24 * 60 * 60` (432000 seconds).
 */
export const getCachedVisitorChatDataContext = unstable_cache(
  buildVisitorChatDynamicContextUncached,
  ['visitor-chat-supabase-snapshot'],
  { revalidate: false },
)
