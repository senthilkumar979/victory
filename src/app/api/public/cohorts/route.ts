import { NextResponse } from 'next/server'

import { listCohorts } from '@/lib/assignments/assignmentService'

/** Public read-only cohort list for filters (id + name only). */
export async function GET() {
  try {
    const cohorts = await listCohorts()
    return NextResponse.json({ cohorts })
  } catch (err) {
    console.error('[api/public/cohorts]', err)
    return NextResponse.json(
      { error: 'Could not load cohorts.' },
      { status: 500 },
    )
  }
}
