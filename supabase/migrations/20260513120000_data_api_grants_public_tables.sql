/*
  Supabase Data API (PostgREST) — explicit grants for `public` tables.

  Context: From May 30 2026 (new projects) and Oct 30 2026 (existing projects),
  new tables in `public` no longer receive implicit API grants; PostgREST returns
  42501 until you GRANT to `anon`, `authenticated`, and/or `service_role`.

  This migration locks in grants for tables used by MentorBridge (grep for
  `.from('...')` / table constants). Tables that do not exist yet are skipped.

  SECURITY: These grants allow the API *roles* to attempt operations; Row Level
  Security (RLS) must still enforce what each role can actually read/write.
  Review RLS policies in the Supabase Dashboard before/after applying.

  Apply: `supabase db push` or paste into SQL Editor (staging first, then prod).
*/

grant usage on schema public to anon, authenticated, service_role;

do $$
declare
  tbl text;
  tables text[] := array[
    'students',
    'blogs',
    'announcements',
    'visitor_chat_queries',
    'awards',
    'award_categories',
    'meetings',
    'hall_of_fame',
    'google_groups',
    'presenters',
    'partners',
    'roadmap_completions',
    'web_push_subscriptions',
    'cohorts',
    'assignments',
    'assignment_submissions'
  ];
begin
  foreach tbl in array tables
  loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = tbl
    ) then
      execute format(
        'grant select, insert, update, delete on table public.%I to anon, authenticated',
        tbl
      );
      execute format(
        'grant all on table public.%I to service_role',
        tbl
      );
    end if;
  end loop;
end $$;

-- Serial / identity columns need sequence USAGE for inserts via PostgREST.
grant usage, select on all sequences in schema public to anon, authenticated;
grant all on all sequences in schema public to service_role;

/*
  Future tables created as `postgres` (e.g. SQL Editor / many migrations) inherit
  these defaults. If your team uses another role for DDL, duplicate the block with
  `for role <that_role>`.
*/
alter default privileges for role postgres in schema public
grant select, insert, update, delete on tables to anon, authenticated;

alter default privileges for role postgres in schema public
grant all on tables to service_role;

alter default privileges for role postgres in schema public
grant usage, select on sequences to anon, authenticated;

alter default privileges for role postgres in schema public
grant all on sequences to service_role;
