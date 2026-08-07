import { supabase } from './supabaseClient'
import { getUkDateString } from './ukDate'

export const CATEGORIES = ['movie', 'proverb', 'song', 'book']

// Fetches today's puzzle for every category, keyed to the current UK
// calendar date, so all players worldwide see the same daily set.
export async function fetchTodaysPuzzles() {
  const puzzleDate = getUkDateString()

  const { data, error } = await supabase
    .from('daily_puzzles')
    .select('category, puzzle:puzzles(*)')
    .eq('puzzle_date', puzzleDate)

  if (error) throw error

  const byCategory = {}
  for (const row of data) {
    byCategory[row.category] = row.puzzle
  }
  return byCategory
}
