/*
  Fix "permission denied for table cohorts" when saving student profiles.

  Updating students.cohort_id fires sync_student_batch_from_cohort, which
  SELECTs from cohorts. That trigger ran as the API role (anon/authenticated),
  but cohorts was revoked from those roles in 20260709120000.

  1. SECURITY DEFINER trigger — reads cohorts as function owner.
  2. SELECT grant + RLS — cohort id/name are public directory data (filters, forms).
*/

create or replace function public.sync_student_batch_from_cohort()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.cohort_id is not null then
    select name into new.batch from public.cohorts where id = new.cohort_id;
  end if;
  return new;
end;
$$;

grant select on table public.cohorts to anon, authenticated;

drop policy if exists cohorts_public_read on public.cohorts;
create policy cohorts_public_read
  on public.cohorts
  for select
  to anon, authenticated
  using (true);
