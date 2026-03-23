// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

// These should be set in your Supabase project environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.')
}

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY env vars.')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

webpush.setVapidDetails('mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

interface BroadcastPayload {
  title: string
  body?: string
  url?: string
}

const ALLOWED_ORIGIN = Deno.env.get('PUSH_BROADCAST_ALLOWED_ORIGIN') ?? '*'

const withCors = (body: BodyInit | null, init: ResponseInit = {}): Response =>
  new Response(body, {
    ...init,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
      ...(init.headers ?? {}),
    },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return withCors(null, { status: 204 })
  }

  if (req.method !== 'POST') {
    return withCors('Method not allowed', { status: 405 })
  }

  let payload: BroadcastPayload

  try {
    payload = (await req.json()) as BroadcastPayload
  } catch {
    return withCors('Invalid JSON body', { status: 400 })
  }

  if (!payload.title) {
    return withCors('Missing title', { status: 400 })
  }

  const { data: subscriptions, error } = await supabase
    .from('web_push_subscriptions')
    .select('endpoint, keys')

  if (error) {
    console.error('Failed to fetch subscriptions', error)
    return withCors('Failed to fetch subscriptions', { status: 500 })
  }

  const notificationData = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? '/',
    tag: 'announcement',
  })

  const sendTasks =
  subscriptions?.map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint as string,
          keys: sub.keys as { p256dh: string; auth: string },
        },
        notificationData,
      )
    } catch (err) {
      console.error('Failed to send notification to', sub.endpoint, err)

      const status = (err as { statusCode?: number })?.statusCode
      if (status === 404 || status === 410) {
        // Clean up invalid subscription
        await supabase
          .from('web_push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint as string)
      }
    }
  }) ?? []

  await Promise.allSettled(sendTasks)

  return withCors('Broadcast complete', { status: 200 })
})

