import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { publishLogSnagEvent } from '@/lib/logsnag/publish'

const CHANNEL_RE = /^[a-z0-9][a-z0-9_-]{0,39}$/i
const EVENT_RE = /^[\s\S]{1,120}$/

interface TrackBody {
  channel?: unknown
  event?: unknown
  description?: unknown
  icon?: unknown
  tags?: unknown
}

function sanitizeTags(
  input: unknown,
): Record<string, string | number | boolean> | undefined {
  if (!input || typeof input !== 'object') return undefined
  const out: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(input)) {
    const key = k.toLowerCase()
    if (key.length > 40) continue
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
      out[key] = v
  }
  return Object.keys(out).length ? out : undefined
}

export async function POST(request: Request) {
  let body: TrackBody
  try {
    body = (await request.json()) as TrackBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const channel =
    typeof body.channel === 'string' ? body.channel.trim() : ''
  const event =
    typeof body.event === 'string' ? body.event.trim() : 'Page view'
  const description =
    typeof body.description === 'string' ? body.description.trim() : undefined
  const icon =
    typeof body.icon === 'string' ? body.icon.trim().slice(0, 8) : undefined

  if (!CHANNEL_RE.test(channel)) {
    return NextResponse.json(
      { error: 'Invalid or missing channel' },
      { status: 400 },
    )
  }
  if (!EVENT_RE.test(event)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  }

  const { userId } = await auth()
  const tags = sanitizeTags(body.tags)

  const result = await publishLogSnagEvent({
    channel,
    event,
    description,
    icon: icon || undefined,
    user_id: userId ?? undefined,
    tags,
  })

  if (result.ok) return NextResponse.json({ ok: true }, { status: 200 })
  if ('skipped' in result && result.skipped) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 })
  }
  return NextResponse.json(
    { error: 'error' in result ? result.error : 'Publish failed' },
    { status: 502 },
  )
}
