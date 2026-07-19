import { NextResponse } from 'next/server'

import { authenticateMobileRequest } from '@/lib/auth/authenticateMobileRequest'
import { isAdminUser } from '@/lib/auth/clerkUser'
import { getStudentForEmail } from '@/lib/auth/requireAuth'

export async function GET() {
  try {
    const auth = await authenticateMobileRequest()
    if ('error' in auth) return auth.error

    const isAdmin = isAdminUser(auth.user)

    // Admins do not need a linked student profile — skip the lookup
    let linkedStudent = null
    if (!isAdmin) {
      try {
        linkedStudent = await getStudentForEmail(auth.email)
      } catch (err) {
        console.error('[mobile/v1/me] linked student lookup failed', err)
      }
    }

    return NextResponse.json({
      user: {
        id: auth.userId,
        email: auth.email,
        firstName: auth.user.firstName,
        lastName: auth.user.lastName,
        imageUrl: auth.user.imageUrl,
        publicMetadata: auth.user.publicMetadata,
      },
      isAdmin,
      linkedStudent: linkedStudent
        ? {
            id: linkedStudent.id,
            name: linkedStudent.name,
            email: linkedStudent.email,
            cohortId: linkedStudent.cohort_id,
            batch: linkedStudent.batch,
          }
        : null,
    })
  } catch (err) {
    console.error('[mobile/v1/me] unhandled error', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
