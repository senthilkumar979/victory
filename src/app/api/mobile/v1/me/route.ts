import { NextResponse } from 'next/server'

import { authenticateMobileRequest } from '@/lib/auth/authenticateMobileRequest'
import { isAdminUser } from '@/lib/auth/clerkUser'
import { getStudentForEmail } from '@/lib/auth/requireAuth'

export async function GET() {
  const auth = await authenticateMobileRequest()
  if ('error' in auth) return auth.error

  const isAdmin = isAdminUser(auth.user)
  const linkedStudent = await getStudentForEmail(auth.email)

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
}
