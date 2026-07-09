import { NextResponse } from 'next/server'

import { listCohorts } from '@/lib/assignments/assignmentService'
import { requireAuth } from '@/lib/auth/requireAuth'

export async function GET() {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  try {
    const cohorts = await listCohorts()
    return NextResponse.json({ cohorts })
  } catch (err) {
    console.error('[api/cohorts]', err)
    return NextResponse.json(
      { error: 'Could not load cohorts.' },
      { status: 500 },
    )
  }
}
