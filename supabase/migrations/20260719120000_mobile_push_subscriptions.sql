-- Mobile push notification subscriptions (FCM / APNs via Expo)
create table if not exists public.mobile_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  device_id text not null,
  platform text not null check (platform in ('android', 'ios')),
  push_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_id)
);

create index if not exists mobile_push_subscriptions_user_id_idx
  on public.mobile_push_subscriptions (user_id);

comment on table public.mobile_push_subscriptions is
  'Native mobile push tokens for MentorBridge Admin app; accessed only via service-role BFF';
