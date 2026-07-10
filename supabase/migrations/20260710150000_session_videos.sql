/*
  Cohort session videos — admin-managed YouTube links for logged-in members.
  Category is a fixed enum (see sessionVideoCategories.ts).
*/

create table if not exists public.session_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  youtube_url text not null,
  youtube_video_id text not null,
  category text not null,
  is_featured boolean not null default false,
  view_count integer not null default 0,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint session_videos_category_check check (
    category in (
      'general_session',
      'chit_chat',
      'react_session',
      'java_session',
      'data_session',
      'story_lab'
    )
  )
);

create index if not exists session_videos_category_idx on public.session_videos (category);
create index if not exists session_videos_view_count_idx on public.session_videos (view_count desc);
create index if not exists session_videos_created_at_idx on public.session_videos (created_at desc);
create index if not exists session_videos_featured_idx on public.session_videos (is_featured)
  where is_featured = true;

drop trigger if exists session_videos_set_updated_at on public.session_videos;
create trigger session_videos_set_updated_at
  before update on public.session_videos
  for each row
  execute function public.set_updated_at();

alter table public.session_videos enable row level security;

revoke all on table public.session_videos from anon, authenticated;
grant select, insert, update, delete on table public.session_videos to service_role;
