import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  buildCommentaryFromGenerated,
  generateLinkedInPostWithGemini,
} from '@/lib/linkedin/generateLinkedInPost'

const bodySchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  primaryLink: z.string().url(),
  context: z.string().optional(),
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
    const generated = await generateLinkedInPostWithGemini(parsed.data)
    const commentary = buildCommentaryFromGenerated(
      generated,
      parsed.data.primaryLink,
    )
    return NextResponse.json(
      { generated, commentary },
      { status: 200 },
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Generation failed'
    console.error('[linkedin/generate-post]', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
