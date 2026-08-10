// Netlify Scheduled Function — keeps daily_puzzles topped up with today's
// row per category, keyed to the current UK calendar date.
//
// Runs hourly rather than on a single fixed UTC cron because Europe/London
// midnight itself shifts between 00:00 UTC (GMT) and 23:00 UTC the previous
// day (BST) across the DST transition — no fixed cron expression stays
// correct year-round. Instead, each hourly run recomputes "today" in
// Europe/London and is idempotent: it only inserts a row when one is
// missing for that date/category, so it's safe to run more often than
// strictly necessary and self-heals if an invocation is skipped or delayed.
//
// Selection is pure random (no curated sequence_order) across whichever
// puzzles in the bank haven't been used yet for that category, cycling
// back to the full bank once every puzzle has appeared at least once.
//
// Requires these Netlify environment variables (site settings, not the
// client-side VITE_ vars — this runs server-side with elevated access):
//   SUPABASE_URL                — same value as VITE_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   — service_role key (RLS bypass for writes)

import { createClient } from '@supabase/supabase-js'

const CATEGORIES = ['movie', 'proverb', 'song', 'book']

function getUkDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(date)
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function previousDateString(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

// Marks exactly one of today's four category rows as the free-to-play one
// (see src/lib/access.js), excluding whatever was free yesterday. Runs
// after assignPuzzleForCategory so today's rows already exist to flip --
// idempotent the same way puzzle assignment is: if a free category is
// already set for this date, later hourly runs leave it alone.
async function assignFreeCategory(supabase, puzzleDate) {
  const { data: existing, error: existingError } = await supabase
    .from('daily_puzzles')
    .select('category')
    .eq('puzzle_date', puzzleDate)
    .eq('is_free', true)
    .maybeSingle()

  if (existingError) return { error: existingError.message }
  if (existing) return { status: 'already assigned', category: existing.category }

  const { data: yesterday, error: yesterdayError } = await supabase
    .from('daily_puzzles')
    .select('category')
    .eq('puzzle_date', previousDateString(puzzleDate))
    .eq('is_free', true)
    .maybeSingle()

  if (yesterdayError) return { error: yesterdayError.message }

  const eligible = CATEGORIES.filter((c) => c !== yesterday?.category)
  const chosen = pickRandom(eligible)

  const { error: updateError } = await supabase
    .from('daily_puzzles')
    .update({ is_free: true })
    .eq('puzzle_date', puzzleDate)
    .eq('category', chosen)

  if (updateError) return { error: updateError.message }
  return { status: 'assigned', category: chosen }
}

async function assignPuzzleForCategory(supabase, category, puzzleDate) {
  const { data: existing, error: existingError } = await supabase
    .from('daily_puzzles')
    .select('id')
    .eq('puzzle_date', puzzleDate)
    .eq('category', category)
    .maybeSingle()

  if (existingError) return { error: existingError.message }
  if (existing) return { status: 'already assigned' }

  const [{ data: pool, error: poolError }, { data: used, error: usedError }] = await Promise.all([
    supabase.from('puzzles').select('id').eq('category', category),
    supabase.from('daily_puzzles').select('puzzle_id').eq('category', category),
  ])

  if (poolError) return { error: poolError.message }
  if (usedError) return { error: usedError.message }
  if (!pool.length) return { error: `no puzzles in bank for category "${category}"` }

  const usedIds = new Set(used.map((row) => row.puzzle_id))
  let available = pool.filter((p) => !usedIds.has(p.id))

  // Whole bank has cycled through for this category — start a new lap,
  // just avoiding an immediate repeat of the most recently used puzzle.
  if (available.length === 0) {
    const { data: last } = await supabase
      .from('daily_puzzles')
      .select('puzzle_id')
      .eq('category', category)
      .order('puzzle_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    available = pool.filter((p) => p.id !== last?.puzzle_id)
    if (available.length === 0) available = pool
  }

  const chosen = pickRandom(available)

  const { error: insertError } = await supabase
    .from('daily_puzzles')
    .insert({ puzzle_date: puzzleDate, category, puzzle_id: chosen.id })

  if (insertError) return { error: insertError.message }
  return { status: 'assigned', puzzle_id: chosen.id }
}

export default async () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const puzzleDate = getUkDateString()

  const results = {}
  for (const category of CATEGORIES) {
    results[category] = await assignPuzzleForCategory(supabase, category, puzzleDate)
  }
  results.free_category = await assignFreeCategory(supabase, puzzleDate)

  return new Response(JSON.stringify({ puzzle_date: puzzleDate, results }, null, 2), {
    headers: { 'content-type': 'application/json' },
  })
}

export const config = {
  schedule: '0 * * * *',
}
