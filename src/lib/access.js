// Central gate for whether the current user can play a given category's
// puzzle today. Every category still gets a real daily_puzzles row and stays
// visible (see rotate-daily-puzzle.js) -- this only decides whether it's
// playable, for the freemium tab structure: one category is designated
// free each day, the rest are locked behind a subscription.
//
// No subscription system exists yet, so this always evaluates to "only
// today's free category, for everyone" regardless of who's signed in.
// Wiring up real subscriptions later means extending the condition below
// (e.g. `|| isSubscribed(session)`) -- every caller (App.jsx, CategoryTabs,
// PuzzleGrid) already routes through this one function, so nothing else
// needs to change.
// `session` is intentionally part of the signature already, unused for now
// -- every call site is already passing it, so wiring up the real check
// (`|| isSubscribed(_session)`) later touches only this function.
export function canPlayCategory({ session: _session, puzzle }) {
  if (!puzzle) return false
  return Boolean(puzzle.is_free)
}
