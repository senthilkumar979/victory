import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  NanoBananaImageError,
  generateNanoBananaImage,
} from '@/lib/nanoBananaImage'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { prompt?: string }
  try {
    body = (await request.json()) as { prompt?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) {
    return NextResponse.json(
      { error: 'Missing or empty `prompt`.' },
      { status: 400 },
    )
  }

  try {
    const { imageBase64, mimeType } = await generateNanoBananaImage(prompt)
    return NextResponse.json(
      { imageBase64, mimeType },
      { status: 200 },
    )
  } catch (e) {
    if (e instanceof NanoBananaImageError) {
      const status =
        e.kind === 'quota' ? 429 : e.kind === 'safety' ? 422 : 500
      return NextResponse.json(
        { error: e.message, code: e.kind },
        { status },
      )
    }
    console.error('nano-banana generate:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Generation failed' },
      { status: 500 },
    )
  }
}
