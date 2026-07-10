/*
  Assignment category: Frontend, Backend, Data, Misc
*/

alter table public.assignments
  add column if not exists category text;

update public.assignments
set category = 'Misc'
where category is null;

alter table public.assignments
  alter column category set default 'Misc',
  alter column category set not null;

alter table public.assignments
  drop constraint if exists assignments_category_check;

alter table public.assignments
  add constraint assignments_category_check
  check (category in ('Frontend', 'Backend', 'Data', 'Misc'));

create index if not exists assignments_category_idx on public.assignments (category);
