import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import { getMobileDb, mobileErrorResponse } from '@/lib/mobile/mobileApiUtils'

export async function POST(request: Request) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const body = (await request.json()) as {
      deviceId?: string
      platform?: string
      pushToken?: string
    }

    if (!body.deviceId?.trim() || !body.pushToken?.trim()) {
      return NextResponse.json(
        {
          error: 'deviceId and pushToken are required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      )
    }

    const platform = body.platform === 'ios' ? 'ios' : 'android'
    const db = getMobileDb()

    const { data, error } = await db
      .from('mobile_push_subscriptions')
      .upsert(
        {
          user_id: auth.userId,
          device_id: body.deviceId.trim(),
          platform,
          push_token: body.pushToken.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,device_id' },
      )
      .select('id, user_id, device_id, platform, push_token, created_at')
      .single()

    if (error) {
      console.error('[mobile/push/register]', error)
      return NextResponse.json(
        { error: 'Could not register push token', code: 'INTERNAL_ERROR' },
        { status: 500 },
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
