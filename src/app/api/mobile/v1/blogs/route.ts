import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import { listTableRows } from '@/lib/mobile/adminCrudService'
import {
  mobileErrorResponse,
  parsePagination,
} from '@/lib/mobile/mobileApiUtils'

export async function GET(request: Request) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const url = new URL(request.url)
    const { page, limit } = parsePagination(url)
    const result = await listTableRows('blogs', '*', page, limit, 'id', false)
    return NextResponse.json(result)
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
