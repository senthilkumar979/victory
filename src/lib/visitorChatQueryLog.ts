import 'server-only'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * Persists each visitor question to `visitor_chat_queries` (Supabase).
 * Requires `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` on the server.
 */
export async function insertVisitorChatQuery(params: {
  query: string
  threadMessageCount: number
}): Promise<void> {
  const db = supabaseAdmin
  if (!db) {
    console.warn(
      '[visitor-chat] supabaseAdmin unavailable; set SUPABASE_SERVICE_ROLE_KEY to log queries',
    )
    return
  }

  const { error } = await db.from('visitor_chat_queries').insert({
    query_text: params.query,
    thread_message_count: params.threadMessageCount,
  })

  if (error) {
    console.error('[visitor-chat] failed to insert visitor_chat_queries row:', error)
  }
}
