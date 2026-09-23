-- INITIALLY v2 -- invite-to-unlock and the weekly leaderboard.
-- Run in the Supabase SQL Editor, after add_delete_own_account.sql.
--
-- Replaces the old "sign in for a bonus category" and "share to unlock
-- today" gates (see src/lib/access.js). Each player gets an invite link;
-- every friend who creates an account through it earns one permanent
-- category unlock (the player picks which), and three or more friends
-- unlock everything. Unlocks last until subscriptions arrive.
--
-- Every write to profiles goes through a security definer RPC below, never
-- a direct client update -- otherwise a player could grant themselves
-- unlocks or invites from the browser console. Clients can read only their
-- own row; other players' names are exposed only through the leaderboard
-- functions.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  invite_code text not null unique,
  -- A friend who deletes their account stops counting towards the
  -- inviter's total, but categories already picked stay unlocked.
  invited_by uuid references auth.users(id) on delete set null,
  unlocked_categories text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Names are unique ignoring case, so "Paul" and "paul" can't both exist.
create unique index if not exists idx_profiles_display_name_lower
  on public.profiles (lower(display_name));
create index if not exists idx_profiles_invited_by on public.profiles (invited_by);

alter table public.profiles enable row level security;

drop policy if exists "users can view their own profile" on public.profiles;
create policy "users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- 6 characters from an alphabet with no 0/O/1/I/L, so a code read aloud or
-- typed from a screenshot is hard to get wrong.
create or replace function public.generate_invite_code()
returns text
language plpgsql
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where invite_code = code);
  end loop;
  return code;
end;
$$;

-- Every new auth user gets a profile (and so an invite code) immediately.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, invite_code)
  values (new.id, public.generate_invite_code())
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Backfill players who signed up before this migration.
insert into public.profiles (user_id, invite_code)
select u.id, public.generate_invite_code()
from auth.users u
where not exists (select 1 from public.profiles p where p.user_id = u.id);

-- ---------------------------------------------------------------------------
-- Reading your own profile
-- ---------------------------------------------------------------------------

create or replace function public.get_my_profile()
returns table (
  display_name text,
  invite_code text,
  unlocked_categories text[],
  invite_count int,
  invited_by_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.display_name,
    p.invite_code,
    p.unlocked_categories,
    (select count(*)::int from public.profiles f where f.invited_by = p.user_id),
    (select i.display_name from public.profiles i where i.user_id = p.invited_by)
  from public.profiles p
  where p.user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Display names
-- ---------------------------------------------------------------------------

-- Deliberately short and blunt -- catches the obvious cases so a stranger's
-- leaderboard isn't full of slurs. Words that hide inside innocent names
-- (Hitchcock, Dickens, grapes) are left off on purpose; this is a puzzle
-- game about film and book titles. Anything subtler is caught by the Report
-- button (report_display_name below), which App Store guideline 1.2 expects
-- alongside a filter for any player-chosen text other players can see.
create or replace function public.is_display_name_allowed(name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select not (
    regexp_replace(lower(name), '[^a-z]', '', 'g') ~
      '(fuck|shit|cunt|bitch|nigg|fag|slut|whore|nazi|hitler|penis|vagina|porn|twat|wank|bastard|retard|pussy|asshole|arsehole|admin|moderator|initially)'
  );
$$;

create or replace function public.set_display_name(new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned text := btrim(regexp_replace(new_name, '\s+', ' ', 'g'));
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if length(cleaned) < 3 or length(cleaned) > 20 then
    raise exception 'Names must be 3 to 20 characters.';
  end if;
  if cleaned !~ '^[A-Za-z0-9][A-Za-z0-9 ._-]*$' then
    raise exception 'Use letters, numbers, spaces, dots, dashes or underscores.';
  end if;
  if not public.is_display_name_allowed(cleaned) then
    raise exception 'Please choose a different name.';
  end if;
  if exists (
    select 1 from public.profiles
    where lower(display_name) = lower(cleaned) and user_id <> auth.uid()
  ) then
    raise exception 'That name is taken — try another.';
  end if;

  update public.profiles set display_name = cleaned where user_id = auth.uid();
end;
$$;

-- ---------------------------------------------------------------------------
-- Invites and unlocks
-- ---------------------------------------------------------------------------

-- Called once, right after a player signs in with an invite code waiting
-- (from the ?invite= link or typed in). Only counts for genuinely new
-- accounts -- created in the last day, not already credited to someone --
-- so existing players can't be farmed as "invites". Returns the inviter's
-- display name (or '' when they haven't set one) on success, null when the
-- code doesn't count.
create or replace function public.claim_invite(code text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  inviter uuid;
  inviter_name text;
begin
  if me is null then
    raise exception 'not signed in';
  end if;

  select user_id, display_name into inviter, inviter_name
  from public.profiles
  where invite_code = upper(btrim(code));

  if inviter is null or inviter = me then
    return null;
  end if;
  -- No invite loops: you can't be credited to someone you invited.
  if exists (select 1 from public.profiles where user_id = inviter and invited_by = me) then
    return null;
  end if;
  if not exists (
    select 1 from auth.users where id = me and created_at > now() - interval '1 day'
  ) then
    return null;
  end if;

  update public.profiles
  set invited_by = inviter
  where user_id = me and invited_by is null;

  if not found then
    return null;
  end if;
  return coalesce(inviter_name, '');
end;
$$;

-- Spends one earned unlock slot on a category, permanently. Slots are one
-- per friend who joined, up to three; at three every category is open
-- anyway (see canPlayCategory), so there's nothing left to pick.
create or replace function public.unlock_category(category text)
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  friends int;
  current_unlocks text[];
begin
  if me is null then
    raise exception 'not signed in';
  end if;
  if category not in ('movie', 'proverb', 'song', 'book') then
    raise exception 'unknown category';
  end if;

  select count(*)::int into friends from public.profiles where invited_by = me;
  select unlocked_categories into current_unlocks from public.profiles where user_id = me;

  if category = any(current_unlocks) then
    return current_unlocks;
  end if;
  if coalesce(array_length(current_unlocks, 1), 0) >= least(friends, 3) then
    raise exception 'Invite another friend to unlock this category.';
  end if;

  update public.profiles
  set unlocked_categories = array_append(unlocked_categories, category)
  where user_id = me
  returning unlocked_categories into current_unlocks;

  return current_unlocks;
end;
$$;

-- ---------------------------------------------------------------------------
-- Weekly leaderboard
-- ---------------------------------------------------------------------------

-- A player's result for each of this week's puzzles: 7 minus guesses for a
-- win (6 points for a first-guess solve, 1 for a sixth-guess one), 0 for a
-- loss. Replays or a second device can insert more than one plays row for
-- the same puzzle, so only the best counts. The week runs Monday to Sunday
-- by UK calendar date -- the same clock daily_puzzles uses.
create or replace function public.weekly_points()
returns table (user_id uuid, points int, solved int)
language sql
stable
security definer
set search_path = ''
as $$
  with best as (
    select pl.user_id, pl.daily_puzzle_id,
      max(case when pl.won then greatest(7 - pl.guesses_used, 1) else 0 end) as pts
    from public.plays pl
    join public.daily_puzzles dp on dp.id = pl.daily_puzzle_id
    where dp.puzzle_date >= date_trunc('week', (now() at time zone 'Europe/London'))::date
      and dp.puzzle_date <= (now() at time zone 'Europe/London')::date
    group by pl.user_id, pl.daily_puzzle_id
  )
  select b.user_id, sum(b.pts)::int, count(*) filter (where b.pts > 0)::int
  from best b
  group by b.user_id;
$$;

-- Three reports from different players hides a name (shown as "Player")
-- until someone reviews it in the name_reports table.
create table if not exists public.name_reports (
  reporter uuid not null references auth.users(id) on delete cascade,
  reported uuid not null references auth.users(id) on delete cascade,
  reported_name text not null,
  created_at timestamptz not null default now(),
  primary key (reporter, reported)
);

alter table public.name_reports enable row level security;

create or replace function public.leaderboard_name(uid uuid, name text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when (select count(*) from public.name_reports r where r.reported = uid) >= 3 then 'Player'
    else name
  end;
$$;

-- Everyone who has a display name and at least one play this week, ranked.
-- Ties share a rank (1, 2, 2, 4) -- fairer than an arbitrary order.
create or replace function public.ranked_this_week()
returns table (user_id uuid, rank int, display_name text, points int, solved int)
language sql
stable
security definer
set search_path = ''
as $$
  select w.user_id,
    (rank() over (order by w.points desc))::int,
    public.leaderboard_name(p.user_id, p.display_name),
    w.points,
    w.solved
  from public.weekly_points() w
  join public.profiles p on p.user_id = w.user_id
  where p.display_name is not null;
$$;

create or replace function public.get_leaderboard(max_rows int default 50)
returns table (user_id uuid, rank int, display_name text, points int, solved int, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select r.user_id, r.rank, r.display_name, r.points, r.solved, r.user_id = auth.uid()
  from public.ranked_this_week() r
  order by r.rank, r.display_name
  limit least(greatest(max_rows, 1), 100);
$$;

-- Friends are the people you invited plus whoever invited you -- and you,
-- so you can see where you sit among them. Ranks are global, so "#214"
-- here means the same as on the Top 50 tab. Friends with no plays yet this
-- week still appear, at 0 points and no rank.
create or replace function public.get_friends_leaderboard()
returns table (user_id uuid, rank int, display_name text, points int, solved int, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select user_id, invited_by from public.profiles where user_id = auth.uid()
  ),
  circle as (
    select user_id from me
    union select invited_by from me where invited_by is not null
    union select p.user_id from public.profiles p, me where p.invited_by = me.user_id
  )
  select c.user_id, r.rank,
    coalesce(r.display_name, public.leaderboard_name(p.user_id, p.display_name), 'New player'),
    coalesce(r.points, 0), coalesce(r.solved, 0), c.user_id = auth.uid()
  from circle c
  join public.profiles p on p.user_id = c.user_id
  left join public.ranked_this_week() r on r.user_id = c.user_id
  order by coalesce(r.points, 0) desc, 3;
$$;

create or replace function public.get_my_rank()
returns table (rank int, points int, solved int, total_players int)
language sql
stable
security definer
set search_path = ''
as $$
  select r.rank, r.points, r.solved, (select count(*)::int from public.ranked_this_week())
  from public.ranked_this_week() r
  where r.user_id = auth.uid();
$$;

create or replace function public.report_display_name(target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if target = auth.uid() then
    return;
  end if;
  insert into public.name_reports (reporter, reported, reported_name)
  select auth.uid(), target, p.display_name
  from public.profiles p
  where p.user_id = target and p.display_name is not null
  on conflict do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permissions: signed-in players call the RPCs; nobody calls the helpers
-- directly, and signed-out visitors get nothing.
-- ---------------------------------------------------------------------------

revoke execute on function public.generate_invite_code() from public, anon, authenticated;
revoke execute on function public.handle_new_user_profile() from public, anon, authenticated;
revoke execute on function public.weekly_points() from public, anon, authenticated;
revoke execute on function public.ranked_this_week() from public, anon, authenticated;
revoke execute on function public.leaderboard_name(uuid, text) from public, anon, authenticated;

revoke execute on function public.get_my_profile() from public, anon;
revoke execute on function public.set_display_name(text) from public, anon;
revoke execute on function public.claim_invite(text) from public, anon;
revoke execute on function public.unlock_category(text) from public, anon;
revoke execute on function public.get_leaderboard(int) from public, anon;
revoke execute on function public.get_friends_leaderboard() from public, anon;
revoke execute on function public.get_my_rank() from public, anon;
revoke execute on function public.report_display_name(uuid) from public, anon;

grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.set_display_name(text) to authenticated;
grant execute on function public.claim_invite(text) to authenticated;
grant execute on function public.unlock_category(text) to authenticated;
grant execute on function public.get_leaderboard(int) to authenticated;
grant execute on function public.get_friends_leaderboard() to authenticated;
grant execute on function public.get_my_rank() to authenticated;
grant execute on function public.report_display_name(uuid) to authenticated;
