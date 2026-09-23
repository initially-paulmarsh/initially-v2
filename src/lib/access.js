// Central gate for whether the current player can play a given category's
// puzzle today. Every category still gets a real daily_puzzles row and stays
// visible (see rotate-daily-puzzle.js) -- this only decides whether it's
// playable. Ways in:
//   1. It's today's designated free category (is_free) -- open to everyone.
//   2. The player unlocked it for good by inviting a friend who signed up
//      (one friend, one category of their choosing -- see unlock_category
//      in add_invites_and_leaderboard.sql).
//   3. Three or more friends have joined, which opens every category.
// Unlocks are permanent until subscriptions arrive, so nobody has to
// re-share every day.
export const FRIENDS_FOR_ALL_CATEGORIES = 3

export function canPlayCategory({ puzzle, profile }) {
  if (!puzzle) return false
  if (puzzle.is_free) return true
  if (!profile) return false
  if (profile.invite_count >= FRIENDS_FOR_ALL_CATEGORIES) return true
  return profile.unlocked_categories.includes(puzzle.category)
}

// How many permanent unlocks the player has earned but not yet spent on a
// category. Zero once everything is open anyway.
export function unspentUnlocks(profile) {
  if (!profile || profile.invite_count >= FRIENDS_FOR_ALL_CATEGORIES) return 0
  return Math.max(profile.invite_count - profile.unlocked_categories.length, 0)
}
