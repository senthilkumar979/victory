import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import { mobileErrorResponse } from '@/lib/mobile/mobileApiUtils'
import { getStudentAwards } from '@/lib/mobile/studentService'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    const awards = await getStudentAwards(id)
    return NextResponse.json({ data: awards })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
