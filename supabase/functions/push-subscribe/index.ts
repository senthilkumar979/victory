// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// These should be set in your Supabase project environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

interface PushSubscriptionPayload {
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
}

const ALLOWED_ORIGIN = Deno.env.get('PUSH_SUBSCRIBE_ALLOWED_ORIGIN') ?? '*'

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

  let body: PushSubscriptionPayload
  try {
    body = (await req.json()) as PushSubscriptionPayload
  } catch {
    return withCors('Invalid JSON body', { status: 400 })
  }

  const { subscription } = body
  if (!subscription?.endpoint || !subscription?.keys) {
    return withCors('Invalid subscription payload', { status: 400 })
  }

  const { endpoint, keys } = subscription

  // Upsert by endpoint so same browser doesn't create duplicates
  const { error } = await supabase
    .from('web_push_subscriptions')
    .upsert(
      {
        endpoint,
        keys,
      },
      { onConflict: 'endpoint' },
    )

  if (error) {
    console.error('Failed to store subscription', error)
    return withCors('Failed to store subscription', { status: 500 })
  }

  return withCors('Subscription stored', { status: 200 })
})