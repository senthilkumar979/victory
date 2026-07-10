/*
  Assignment submission feedback: decimal rating, reviewer name, optional comment.
*/

alter table public.assignment_submissions
  add column if not exists rating numeric(3, 1)
    check (rating is null or (rating >= 1 and rating <= 5)),
  add column if not exists feedback_comment text,
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz;
