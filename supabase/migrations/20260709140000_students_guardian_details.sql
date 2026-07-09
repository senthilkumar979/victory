-- Guardian contact details (admin-only in UI; stored on students)
alter table public.students
  add column if not exists father_guardian_details text,
  add column if not exists mother_details text;

comment on column public.students.father_guardian_details is
  'Father or guardian contact details; visible to admins only in the app';

comment on column public.students.mother_details is
  'Mother contact details; visible to admins only in the app';
