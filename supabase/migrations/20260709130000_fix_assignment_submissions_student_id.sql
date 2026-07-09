/*
  Fix assignment_submissions.student_id type when migration failed mid-run.

  students.id is text; an earlier migration incorrectly used uuid for student_id.
  Safe to run if assignment_submissions does not exist yet (no-op) or if the
  table was never created due to the FK error.
*/

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'assignment_submissions'
      and column_name = 'student_id'
      and udt_name = 'uuid'
  ) then
    alter table public.assignment_submissions
      drop constraint if exists assignment_submissions_student_id_fkey;

    alter table public.assignment_submissions
      alter column student_id type text using student_id::text;

    alter table public.assignment_submissions
      add constraint assignment_submissions_student_id_fkey
      foreign key (student_id) references public.students (id) on delete cascade;
  end if;
end $$;

-- If the table was never created, create it with the correct types.
create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
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

drop trigger if exists assignment_submissions_set_updated_at on public.assignment_submissions;
create trigger assignment_submissions_set_updated_at
  before update on public.assignment_submissions
  for each row
  execute function public.set_updated_at();

alter table public.assignment_submissions enable row level security;

revoke all on table public.assignment_submissions from anon, authenticated;
grant select, insert, update, delete on table public.assignment_submissions to service_role;
