import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import { getAdminDashboard } from '@/lib/mobile/dashboardService'
import { mobileErrorResponse } from '@/lib/mobile/mobileApiUtils'

export async function GET() {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const dashboard = await getAdminDashboard()
    return NextResponse.json({ data: dashboard })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
