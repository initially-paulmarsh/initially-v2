-- INITIALLY v2 — Today's daily_puzzles setup
-- Run this once in the Supabase SQL Editor (requires elevated privileges; RLS blocks
-- writes via the anon key, same as seed_puzzles.sql).
--
-- Picks one well-known puzzle per category, backfills real hints + fun_fact for
-- just these four rows (movies/proverbs have no hints data yet bank-wide — see
-- seed_puzzles.sql), then assigns them as today's daily_puzzles row, keyed to the
-- current UK calendar date.

-- 1. Backfill hints + fun_fact for the four chosen puzzles

update puzzles set
  hints = '{"year": 1991, "genre": "Psychological horror thriller", "author": "Jonathan Demme (director)", "country": "USA", "decade": "1990s"}'::jsonb,
  fun_fact = 'The Silence of the Lambs (1991) is one of only three films ever to win all five top Oscars: Picture, Director, Actor, Actress, and Screenplay.'
where id = 'd918fcfb-68be-4d35-acf1-5753ad039b70'; -- movie: The Silence of the Lambs

update puzzles set
  hints = '{"genre": "Wisdom / motivational proverb", "author": "Traditionally attributed to Laozi, Tao Te Ching", "country": "China (ancient origin)", "decade": "Ancient, c. 6th century BCE"}'::jsonb,
  fun_fact = 'The original Chinese phrase refers to a journey of a thousand "li" (a traditional unit of distance) — "miles" is the common English translation.'
where id = '9ccbddde-51ae-4d75-9808-e3f92d604abf'; -- proverb: A journey of a thousand miles...

update puzzles set
  hints = hints || '{"year": 1970, "genre": "Folk rock / gospel-influenced ballad", "country": "USA", "decade": "1970s"}'::jsonb,
  fun_fact = '"Bridge Over Troubled Water" (1970) was the title track of Simon & Garfunkel''s final studio album together before the duo split up that same year.'
where id = '89aca916-827f-4666-adc0-635748bdb40a'; -- song: Bridge Over Troubled Water

update puzzles set
  hints = hints || '{"year": 1952, "genre": "Literary novella", "country": "USA / Cuba", "decade": "1950s"}'::jsonb,
  fun_fact = 'Ernest Hemingway wrote The Old Man and the Sea (1952) in Cuba; it won the Pulitzer Prize the following year and was cited directly in his 1954 Nobel Prize in Literature.'
where id = '4ec144ff-24f3-41a4-9607-66ef22aaf3f0'; -- book: The Old Man and the Sea

-- 2. Assign today's daily_puzzles, keyed to the current UK calendar date

insert into daily_puzzles (puzzle_date, category, puzzle_id)
values
  ((now() at time zone 'Europe/London')::date, 'movie', 'd918fcfb-68be-4d35-acf1-5753ad039b70'),
  ((now() at time zone 'Europe/London')::date, 'proverb', '9ccbddde-51ae-4d75-9808-e3f92d604abf'),
  ((now() at time zone 'Europe/London')::date, 'song', '89aca916-827f-4666-adc0-635748bdb40a'),
  ((now() at time zone 'Europe/London')::date, 'book', '4ec144ff-24f3-41a4-9607-66ef22aaf3f0')
on conflict (puzzle_date, category) do update
  set puzzle_id = excluded.puzzle_id;
