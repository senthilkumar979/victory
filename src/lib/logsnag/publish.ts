import 'server-only'

import { LogSnag } from 'logsnag'
import type { TrackOptions } from 'logsnag'

let client: LogSnag | null = null

function getClient(): LogSnag | null {
  const token = process.env.LOGSNAG_API_TOKEN?.trim()
  const project = process.env.LOGSNAG_PROJECT?.trim()
  if (!token || !project) return null
  if (!client) client = new LogSnag({ token, project })
  return client
}

export async function publishLogSnagEvent(
  options: TrackOptions,
): Promise<
  { ok: true } | { ok: false; skipped: true } | { ok: false; error: string }
> {
  const c = getClient()
  if (!c) return { ok: false, skipped: true }

  try {
    await c.track(options)
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'LogSnag publish failed'
    console.error('[LogSnag]', msg)
    return { ok: false, error: msg }
  }
}
