import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import {
  mobileErrorResponse,
  parsePagination,
} from '@/lib/mobile/mobileApiUtils'
import { listStudents } from '@/lib/mobile/studentService'

export async function GET(request: Request) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const url = new URL(request.url)
    const { page, limit } = parsePagination(url)
    const result = await listStudents({
      page,
      limit,
      search: url.searchParams.get('search') ?? undefined,
      cohort: url.searchParams.get('cohort') ?? undefined,
      company: url.searchParams.get('company') ?? undefined,
      role: url.searchParams.get('role') ?? undefined,
    })
    return NextResponse.json(result)
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
