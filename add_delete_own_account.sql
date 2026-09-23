-- INITIALLY v2 -- lets a signed-in player delete their own account from
-- inside the app, which App Store guideline 5.1.1(v) requires for any app
-- that lets people create one (see deleteAccount in src/lib/auth.js).
-- Run in the Supabase SQL Editor.
--
-- security definer because the anon/authenticated roles can't touch
-- auth.users; it only ever acts on auth.uid(), so a player can delete
-- nobody but themselves. user_stats and plays reference auth.users
-- without on delete cascade, so they're cleared first.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;

  delete from public.plays where user_id = uid;
  delete from public.user_stats where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- Also cascade user deletes to user_stats and plays, so deleting a user
-- from the Supabase dashboard (Authentication > Users) works too --
-- without this it fails with "Database error deleting user" for anyone
-- who has played.
alter table public.user_stats
  drop constraint user_stats_user_id_fkey,
  add constraint user_stats_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.plays
  drop constraint plays_user_id_fkey,
  add constraint plays_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
