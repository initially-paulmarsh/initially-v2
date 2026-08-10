-- INITIALLY v2 -- adds the "free category" designation for the new
-- freemium tab structure (see rotate-daily-puzzle.js and src/lib/access.js).
-- Run in the Supabase SQL Editor -- adding a column/index needs elevated
-- privileges the anon key doesn't have, same as every other schema change
-- in this project.
--
-- After this runs, existing daily_puzzles rows (including today's, if
-- already assigned) default to is_free = false. The next scheduled run of
-- rotate-daily-puzzle.js (hourly) will notice no row is marked free for
-- today and assign one -- no manual backfill needed, just up to an hour's
-- wait, or trigger the function manually to backfill immediately.

alter table daily_puzzles add column if not exists is_free boolean not null default false;

create unique index if not exists idx_daily_puzzles_one_free_per_date
  on daily_puzzles (puzzle_date)
  where is_free;
