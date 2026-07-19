import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import { mobileErrorResponse } from '@/lib/mobile/mobileApiUtils'
import { getStudentFilterOptions } from '@/lib/mobile/studentService'

export async function GET() {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const options = await getStudentFilterOptions()
    return NextResponse.json({ data: options })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
