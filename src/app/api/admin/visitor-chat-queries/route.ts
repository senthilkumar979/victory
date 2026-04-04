import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

const MAX_ROWS = 500

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = supabaseAdmin
  if (!db) {
    return NextResponse.json(
      { error: 'Server database is not configured.' },
      { status: 503 },
    )
  }

  const { data, error } = await db
    .from('visitor_chat_queries')
    .select('id, created_at, query_text, thread_message_count')
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS)

  if (error) {
    console.error('[admin/visitor-chat-queries]', error)
    return NextResponse.json(
      { error: 'Could not load visitor queries.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ queries: data ?? [] })
}
