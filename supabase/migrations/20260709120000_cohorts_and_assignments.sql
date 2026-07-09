/*
  Cohorts table + migrate students.batch → cohort_id
  Assignments + assignment_submissions
*/

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.cohorts (name)
select distinct trim(batch::text)
from public.students
where batch is not null
  and trim(batch::text) <> ''
on conflict (name) do nothing;

alter table public.students
  add column if not exists cohort_id uuid references public.cohorts (id) on delete set null;

update public.students s
set cohort_id = c.id
from public.cohorts c
where s.cohort_id is null
  and s.batch is not null
  and c.name = trim(s.batch::text);

create index if not exists students_cohort_id_idx on public.students (cohort_id);

create or replace function public.sync_student_batch_from_cohort()
returns trigger
language plpgsql
as $$
begin
  if new.cohort_id is not null then
    select name into new.batch from public.cohorts where id = new.cohort_id;
  end if;
  return new;
end;
$$;

drop trigger if exists students_sync_batch_from_cohort on public.students;
create trigger students_sync_batch_from_cohort
  before insert or update of cohort_id on public.students
  for each row
  execute function public.sync_student_batch_from_cohort();

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  cohort_id uuid not null references public.cohorts (id) on delete restrict,
  google_group_id text not null,
  attachments text,
  due_date timestamptz not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assignments_cohort_id_idx on public.assignments (cohort_id);
create index if not exists assignments_due_date_idx on public.assignments (due_date desc);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  -- students.id is text in this project (client-generated ids), not uuid
  student_id text not null references public.students (id) on delete cascade,
  google_doc_url text not null,
  github_repo_url text not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists assignment_submissions_assignment_id_idx
  on public.assignment_submissions (assignment_id);

create index if not exists assignment_submissions_student_id_idx
  on public.assignment_submissions (student_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assignments_set_updated_at on public.assignments;
create trigger assignments_set_updated_at
  before update on public.assignments
  for each row
  execute function public.set_updated_at();

drop trigger if exists assignment_submissions_set_updated_at on public.assignment_submissions;
create trigger assignment_submissions_set_updated_at
  before update on public.assignment_submissions
  for each row
  execute function public.set_updated_at();

alter table public.cohorts enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;

revoke all on table public.cohorts from anon, authenticated;
revoke all on table public.assignments from anon, authenticated;
revoke all on table public.assignment_submissions from anon, authenticated;

grant select, insert, update, delete on table public.cohorts to service_role;
grant select, insert, update, delete on table public.assignments to service_role;
grant select, insert, update, delete on table public.assignment_submissions to service_role;
