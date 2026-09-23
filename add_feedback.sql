-- INITIALLY v2 -- in-app feedback (the Feedback button, bottom left).
-- Run in the Supabase SQL Editor. Read submissions in Table Editor >
-- feedback (newest first: sort by created_at).
--
-- Anyone can send feedback, signed in or not, but nobody can read it back
-- through the API -- insert-only for anon/authenticated, so the table
-- isn't a public message board. The length check stops someone pasting a
-- novel; user_id fills itself in for signed-in players.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  message text not null check (char_length(btrim(message)) between 1 and 2000),
  contact_email text check (contact_email is null or char_length(contact_email) <= 200),
  platform text check (platform is null or platform in ('ios', 'web')),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback"
  on public.feedback for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
