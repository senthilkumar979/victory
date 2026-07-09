import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth/requireAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdmin()
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const db = supabaseAdmin
  if (!db) {
    return NextResponse.json(
      { error: 'Server database is not configured.' },
      { status: 503 },
    )
  }

  const { data, error } = await db
    .from('students')
    .select('father_guardian_details, mother_details')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[api/students/guardian-details]', error)
    return NextResponse.json(
      { error: 'Could not load guardian details.' },
      { status: 500 },
    )
  }

  if (!data) {
    return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
  }

  return NextResponse.json({
    fatherGuardianDetails: data.father_guardian_details ?? '',
    motherDetails: data.mother_details ?? '',
  })
}
