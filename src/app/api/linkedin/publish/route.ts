import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { publishImagePostToLinkedIn } from '@/lib/linkedin/publishToLinkedIn'

const bodySchema = z.object({
  commentary: z.string().min(1),
  imageUrl: z.string().url(),
  imageAltText: z.string().max(4000).optional(),
})

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    const result = await publishImagePostToLinkedIn(parsed.data)
    return NextResponse.json(result, { status: 200 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Publish failed'
    console.error('[linkedin/publish]', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
