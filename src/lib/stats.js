import { supabase } from './supabaseClient'
import { CATEGORIES } from './dailyPuzzle'
import { getUkDateString } from './ukDate'
import { MAX_GUESSES } from './hints'

const STORAGE_KEY = 'initially_stats_v1'

function emptyCategoryStats() {
  const guess_distribution = {}
  for (let i = 1; i <= MAX_GUESSES; i++) guess_distribution[i] = 0
  return {
    current_streak: 0,
    max_streak: 0,
    total_played: 0,
    total_won: 0,
    guess_distribution,
    last_played_date: null,
  }
}

// Local stats are the always-available source of truth for the UI — signed
// out or offline, the stats page still works. Supabase is a best-effort
// mirror layered on top once a session exists (see recordCompletion /
// syncStatsOnSignIn below), so cross-device sync degrades gracefully.
export function getAllLocalStats() {
  let stored = {}
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    stored = {}
  }
  const stats = {}
  for (const category of CATEGORIES) {
    stats[category] = { ...emptyCategoryStats(), ...stored[category] }
  }
  return stats
}

function saveLocalStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

function previousDateString(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

// Records one completed puzzle (win or loss). Updates local stats
// synchronously (so the caller can reflect the new numbers immediately) and,
// when signed in, fires off best-effort Supabase writes without blocking on
// them — a failed/offline sync shouldn't stall the result screen.
export function recordCompletion({ category, won, guessesUsed, dailyPuzzleId, userId }) {
  const puzzleDate = getUkDateString()
  const stats = getAllLocalStats()
  const current = stats[category]

  // A win only extends the streak if the player's last recorded play was
  // yesterday (by UK calendar date) or this is their first-ever play for
  // this category -- any gap day, or a loss, resets it to zero/one.
  const isConsecutive = current.last_played_date === previousDateString(puzzleDate)
  const current_streak = won ? (isConsecutive || !current.last_played_date ? current.current_streak + 1 : 1) : 0

  const guess_distribution = { ...current.guess_distribution }
  if (won) guess_distribution[guessesUsed] = (guess_distribution[guessesUsed] ?? 0) + 1

  const updated = {
    current_streak,
    max_streak: Math.max(current.max_streak, current_streak),
    total_played: current.total_played + 1,
    total_won: current.total_won + (won ? 1 : 0),
    guess_distribution,
    last_played_date: puzzleDate,
  }

  stats[category] = updated
  saveLocalStats(stats)

  if (userId) {
    supabase
      .from('user_stats')
      .upsert({ user_id: userId, category, ...updated }, { onConflict: 'user_id,category' })
      .then(({ error }) => error && console.error('user_stats upsert failed', error))

    if (dailyPuzzleId) {
      supabase
        .from('plays')
        .insert({ user_id: userId, daily_puzzle_id: dailyPuzzleId, guesses_used: guessesUsed, won })
        .then(({ error }) => error && console.error('plays insert failed', error))
    }
  }

  return updated
}

// Runs once when a session appears. If the account already has cloud stats
// for a category, those become the local source of truth on this device
// (the actual cross-device sync). Otherwise this device's local guest
// progress is pushed up to claim the account. Deliberately not a deep
// merge -- reconciling two independent play histories field-by-field risks
// double-counting, so whichever side has data wins wholesale per category.
export async function syncStatsOnSignIn(userId) {
  const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', userId)
  if (error) {
    console.error('fetching user_stats failed', error)
    return
  }

  const remoteByCategory = {}
  for (const row of data) remoteByCategory[row.category] = row

  const local = getAllLocalStats()
  const merged = { ...local }
  const toClaim = []

  for (const category of CATEGORIES) {
    const remote = remoteByCategory[category]
    if (remote) {
      merged[category] = {
        current_streak: remote.current_streak,
        max_streak: remote.max_streak,
        total_played: remote.total_played,
        total_won: remote.total_won,
        guess_distribution: remote.guess_distribution,
        last_played_date: remote.last_played_date,
      }
    } else if (local[category].total_played > 0) {
      toClaim.push({ user_id: userId, category, ...local[category] })
    }
  }

  saveLocalStats(merged)

  if (toClaim.length) {
    const { error: claimError } = await supabase
      .from('user_stats')
      .upsert(toClaim, { onConflict: 'user_id,category' })
    if (claimError) console.error('claiming local stats failed', claimError)
  }
}
