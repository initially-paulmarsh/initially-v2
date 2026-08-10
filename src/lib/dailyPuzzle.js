import { supabase } from './supabaseClient'
import { getUkDateString } from './ukDate'

export const CATEGORIES = ['movie', 'proverb', 'song', 'book']

// Fetches today's puzzle for every category, keyed to the current UK
// calendar date, so all players worldwide see the same daily set.
export async function fetchTodaysPuzzles() {
  const puzzleDate = getUkDateString()

  const { data, error } = await supabase
    .from('daily_puzzles')
    .select('id, category, is_free, puzzle:puzzles(*)')
    .eq('puzzle_date', puzzleDate)

  if (error) throw error

  const byCategory = {}
  for (const row of data) {
    // daily_puzzle_id (not puzzle.id) is what plays.daily_puzzle_id
    // references — carried alongside the puzzle content for stats writes.
    // is_free is the day's freemium gate (see lib/access.js).
    byCategory[row.category] = { ...row.puzzle, daily_puzzle_id: row.id, is_free: row.is_free }
  }
  return byCategory
}
