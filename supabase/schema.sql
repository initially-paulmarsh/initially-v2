-- INITIALLY v2 — Core schema
-- Run this once in the Supabase SQL Editor for a fresh project.

create extension if not exists pgcrypto;

-- Puzzle bank (pre-populated via seed_puzzles.sql)
create table puzzles (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('movie', 'proverb', 'song', 'book')),
  title text not null,
  word_count int not null,
  initials text not null, -- derived/stored explicitly, e.g. "T A P"
  hints jsonb not null default '{}'::jsonb, -- { year, genre, author, country, decade, etc. }
  fun_fact text,
  sequence_order int, -- optional curated ordering for rotation, instead of pure random
  created_at timestamptz default now(),
  constraint title_min_three_words check (word_count >= 3)
);

-- Global "puzzle of the day" per category, keyed to UK calendar date
create table daily_puzzles (
  id uuid primary key default gen_random_uuid(),
  puzzle_date date not null, -- the UK calendar date this puzzle is live for
  category text not null check (category in ('movie', 'proverb', 'song', 'book')),
  puzzle_id uuid references puzzles(id) not null,
  -- Freemium gate: exactly one category is playable for free each day (see
  -- rotate-daily-puzzle.js), chosen at random excluding whatever was free
  -- the day before. All other categories are still visible with a real
  -- puzzle assigned -- just locked behind a subscription (src/lib/access.js).
  is_free boolean not null default false,
  unique (puzzle_date, category)
);

-- Enforces exactly one free category per day at the DB level, as a
-- backstop alongside rotate-daily-puzzle.js's own idempotency check.
create unique index idx_daily_puzzles_one_free_per_date
  on daily_puzzles (puzzle_date)
  where is_free;

-- User stats (auth required — every user is a Supabase Auth user, magic link)
create table user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  category text not null check (category in ('movie', 'proverb', 'song', 'book')),
  current_streak int default 0,
  max_streak int default 0,
  total_played int default 0,
  total_won int default 0,
  guess_distribution jsonb default '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0}',
  last_played_date date, -- UK calendar date of last play, used for streak continuity checks
  updated_at timestamptz default now(),
  unique (user_id, category)
);

-- Individual play records (for analytics + stats history + sharing)
create table plays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  daily_puzzle_id uuid references daily_puzzles(id) not null,
  guesses_used int not null,
  won boolean not null,
  played_at timestamptz default now()
);

-- Indexes for common lookups
create index idx_daily_puzzles_date_category on daily_puzzles (puzzle_date, category);
create index idx_plays_user_id on plays (user_id);

-- Row Level Security
alter table puzzles enable row level security;
alter table daily_puzzles enable row level security;
alter table user_stats enable row level security;
alter table plays enable row level security;

-- Puzzles & daily_puzzles: readable by anyone (anon or authenticated), no client writes.
-- Content is authored/seeded via the SQL editor or a service-role key, not the app.
create policy "puzzles are publicly readable"
  on puzzles for select
  using (true);

create policy "daily_puzzles are publicly readable"
  on daily_puzzles for select
  using (true);

-- user_stats: a user can only see/modify their own row
create policy "users can view their own stats"
  on user_stats for select
  using (auth.uid() = user_id);

create policy "users can insert their own stats"
  on user_stats for insert
  with check (auth.uid() = user_id);

create policy "users can update their own stats"
  on user_stats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- plays: a user can only see/create their own play records
create policy "users can view their own plays"
  on plays for select
  using (auth.uid() = user_id);

create policy "users can insert their own plays"
  on plays for insert
  with check (auth.uid() = user_id);
