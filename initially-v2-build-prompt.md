# INITIALLY v2 — Claude Code Build Prompt

## Project Overview

Build a daily puzzle web app called **INITIALLY** — a Wordle-inspired guessing game where players deduce a movie, proverb, song, or book title from its initials only (e.g., "T A P" → "The Age of Pisces"). One puzzle per category, per day, worldwide. Full rebuild from scratch — no code, assets, or infrastructure carried over from any prior version.

**Core design principle:** every ending — win or lose — should feel emotionally rewarding. Wins feel triumphant and personal. Losses feel warm, encouraging, and educational (never punishing). This emotional payoff is the heart of the retention loop, on top of Wordle-style daily habit mechanics.

**Content rule — non-negotiable:** every puzzle title (movie, proverb, song, or book) must be **3 or more words** in its original, unmodified form. No two-word or single-word titles, ever. Apply this filter at content-seeding time and again as a validation check in the Supabase schema (see below).

**Key product decisions (locked in):**
- **Daily reset:** a single global reset time, anchored to **UK time (Europe/London)** — not per-user local midnight. Every player worldwide gets a new puzzle at the same moment (midnight UK time), which automatically shifts by an hour during UK daylight saving (BST) since it's tied to the IANA timezone rather than a fixed UTC offset. This is far simpler and more reliable than per-user local midnight — no per-user timezone detection or DST edge cases to handle.
- **Auth required (not optional):** Supabase Auth (magic link) is the primary path, not a guest-only fallback. Cross-device streak sync is a core feature, not a nice-to-have.
- **Performance/stats viewing:** users need a dedicated stats view (streak, win %, guess distribution) accessible anytime, not just in the post-puzzle modal.
- **Sharing:** beyond the emoji-grid result share, support sharing overall performance/stats (not just single-puzzle results) to others.

---

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend/Data:** Supabase (Postgres + Auth + Edge Functions)
- **Hosting:** Netlify (static frontend + Netlify Functions for server-side logic)
- **State/Local persistence:** localStorage for guest streaks, Supabase Auth (optional, magic link) for cross-device sync
- **No AI/LLM dependency required** for core gameplay — puzzles are pre-authored/curated content, not generated live

---

## Core Gameplay Mechanics

1. **Categories:** Movie, Proverb, Song, Book — same four as the original concept, selectable via tabs
2. **One puzzle per category per day** — deterministic daily rotation, resetting at **midnight UK time (Europe/London)** for all users globally, simultaneously. This single shared cutoff is computed server-side and applies identically worldwide — no per-user timezone logic needed.
3. **Guess limit:** 6 guesses per puzzle (Wordle standard)
4. **Initials only shown at start:** e.g. "T A P" with underscores/blanks indicating word count and roughly matching word length (optional visual polish)
5. **Progressive hint system** — after each wrong guess, reveal one additional signal:
   - Guess 1 wrong → reveal category-specific metadata (e.g., release year for movies, genre)
   - Guess 2 wrong → reveal one full word from the title (not first word, to avoid trivializing)
   - Guess 3 wrong → reveal author/director/artist name
   - Guess 4 wrong → reveal first letter of each remaining word
   - Guess 5 wrong → final hint before last guess (e.g., country of origin, decade)
6. **Free text guess input** with fuzzy matching (ignore case, punctuation, minor typos — use a string similarity threshold, not exact match only)
7. **Win/loss state** triggers the end-of-puzzle popup (see Message System below)
8. **Streak tracking:** current streak, max streak, win %, guess distribution histogram (classic Wordle stats screen)
9. **Share result:** generate an emoji grid (🟩🟨⬜ or custom) representing guess pattern without spoiling the answer, copyable to clipboard for social sharing

---

## End-of-Puzzle Message System

This is a critical UX differentiator — build a **message bank**, not a single static string, so the experience feels fresh across days.

### Win messages (select based on guess count used, randomize within tier)

**1st guess (rare, huge celebration — confetti animation):**
- "Unbelievable. You just read my mind." 🤯
- "First try?! Okay, certified genius." 🏆
- "That wasn't luck. That was pure instinct." ⚡

**2nd–3rd guess (strong celebration):**
- "Nailed it! You're built different." 🔥
- "Smooth. Confident. Correct. 👏"
- "That's how it's done." 💪

**4th–5th guess (solid win, warm encouragement):**
- "There it is! Squeaked it out like a champion." 🎉
- "You found it — and that's what counts." ✨
- "Persistence pays off. Nice work." 🙌

**6th/last guess (relief + celebration combo):**
- "PHEW. You cut it *so* close — and you still did it!" 😅🎉
- "Down to the wire, but you pulled through!" 🎊
- "That's a nail-biter of a win. Well earned." 😮‍💨

### Loss messages (always warm, always forward-looking, never negative framing)

- "So close! The answer was **[X]** — you'll get tomorrow's, I can feel it." 
- "Tough one today, even sharp minds stumbled on this one. Tomorrow's puzzle is yours." 
- "Missed it today — but now you know a great [movie/song/book/proverb] you might not have found otherwise." 
- "Every streak has a reset sometimes. What matters is you're back tomorrow." 
- "That one was a stumper. The answer: **[X]**. Bet you remember it now!"

Always reveal the answer immediately with a short 1-sentence "fun fact" or context line about it (release year, why it's notable, etc.) so a loss still feels like a small discovery, not just a dead end.

Build this as a `messages.ts` (or `.json`) data file with arrays per tier, and randomly select without repeating the same message twice in a row (store last-shown index in localStorage).

---

## Supabase Schema

```sql
-- Puzzle bank (pre-populated via your existing daily-puzzle-researcher skill content)
create table puzzles (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('movie', 'proverb', 'song', 'book')),
  title text not null,
  word_count int not null,
  initials text not null, -- derived/stored explicitly, e.g. "T A P"
  hints jsonb not null, -- { year, genre, author, country, decade, etc. }
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
  unique (puzzle_date, category)
);

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
```

**UK-time daily rotation logic (simple, no per-user timezone handling needed):**
1. A scheduled function runs once every 24 hours, timed to fire at **00:00 Europe/London** (use a cron library or scheduler that supports IANA timezones directly, e.g. Netlify Scheduled Functions with a cron expression evaluated in UTC but calculated to align with London midnight — or run hourly and check current London time, whichever the chosen scheduler supports more reliably).
2. On each run, it picks the next unused puzzle per category (random or curated `sequence_order`) and inserts a new row into `daily_puzzles` with `puzzle_date` set to the current UK calendar date.
3. Because UK time observes daylight saving (BST in summer, GMT in winter), the actual UTC moment of the reset will shift by one hour twice a year — this is expected and correct, since the goal is "midnight in the UK," not a fixed UTC offset. Using the `Europe/London` IANA timezone (rather than a hardcoded UTC+0 or UTC+1) handles this automatically.
4. On the client, fetch today's puzzle by querying `daily_puzzles` for `puzzle_date = <current UK calendar date>` — compute this client-side via `Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London' })` or equivalent, so all users see the same puzzle regardless of their own device timezone.

**Auth flow:** Supabase Auth with magic link (email-based, no password) as the primary sign-in method. Prompt for sign-in on first launch or first puzzle completion (whichever feels less intrusive to build first) so streaks sync across devices from day one.

---

## App Structure

```
/src
  /components
    PuzzleGrid.tsx       -- initials display + guess history
    GuessInput.tsx        -- text input with fuzzy match submission
    HintPanel.tsx          -- progressive hint reveal
    ResultModal.tsx        -- win/loss popup using message bank
    StatsModal.tsx          -- streak, win%, guess distribution
    StatsPage.tsx            -- standalone, always-accessible performance view (not just post-puzzle)
    ShareButton.tsx          -- emoji grid share (single puzzle result)
    ShareStatsButton.tsx      -- share overall performance/stats card to others
    CategoryTabs.tsx          -- Movie / Proverb / Song / Book switcher
    AuthModal.tsx              -- magic link sign-in
  /lib
    supabaseClient.ts
    fuzzyMatch.ts           -- string similarity for guess validation
    messages.ts             -- win/loss message bank + selection logic
    dailyPuzzle.ts          -- fetch today's puzzle per category, keyed to current UK calendar date
    ukDate.ts                -- compute current UK calendar date client-side (Europe/London)
    stats.ts                -- Supabase-synced streak/stats read+write
    auth.ts                  -- magic link sign-in/session handling
  /pages
    App.tsx
  App.css / tailwind config
netlify/functions/
  rotate-daily-puzzle.ts   -- scheduled function, timed to 00:00 Europe/London, assigns next day's puzzles
```

---

## Build Phases (recommend tackling in this order with Claude Code)

1. **Supabase setup** — create project, run schema SQL, seed with ~30-50 puzzles per category, **every title 3+ words minimum** (use the `daily-puzzle-researcher` skill, which already enforces this word-count rule, to generate verified entries across all four categories)
2. **Core game loop** — static single-puzzle UI, hardcoded puzzle, guess input + fuzzy match + hint reveal, no backend yet
3. **Win/loss modal + message bank** — wire up the emotional payoff system, test all message tiers
4. **Auth** — magic link sign-in flow via Supabase Auth, session persistence
5. **Supabase integration** — replace hardcoded puzzle with live fetch from `daily_puzzles` (keyed to current UK calendar date), wire up cross-device stats sync
6. **Daily rotation function** — build and schedule the Netlify/Supabase function timed to 00:00 Europe/London that assigns next day's puzzles automatically
7. **Standalone stats page** — Wordle-style guess distribution, streaks, win %, viewable anytime (not just post-puzzle)
8. **Share features** — emoji grid generator for single results, plus a shareable performance/stats card for overall stats
9. **Polish pass** — animations (confetti on 1st-guess wins), category tab transitions, mobile responsiveness, dark mode (optional)
10. **Deploy to Netlify** — connect repo, set Supabase env vars, configure the scheduled function

---

## Notes for Claude Code

- Match visual polish/spirit of Wordle: minimal, centered, mobile-first, big bold typography, satisfying micro-animations on each guess submission
- Keep the tone playful and warm throughout the UI copy — not just the end modal, but button labels, empty states, error states too
- Build fuzzy matching to tolerate accents, capitalization, and minor typos, but NOT so loose that wrong answers pass — test with real title variations (e.g. "The Godfather Part II" vs "godfather part 2" should both work)
- Reference the four-category, three-word-minimum content rules already established in the `daily-puzzle-researcher` skill when seeding puzzle content
- For puzzle marketing/launch copy, the `puzzle-marketing-agent` skill already covers social posts, ASO, and push notification text — reuse that once the app is live
- Since the daily reset is a single global UK-time cutoff (not per-user local time), the build is considerably simpler than a per-timezone approach — no client-side timezone detection or DST edge-case handling needed beyond correctly computing "today's date in London" for display/query purposes
