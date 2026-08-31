import { CATEGORIES } from './dailyPuzzle'

// Central gate for whether the current user can play a given category's
// puzzle today. Every category still gets a real daily_puzzles row and stays
// visible (see rotate-daily-puzzle.js) -- this only decides whether it's
// playable. Three ways in:
//   1. It's today's designated free category (is_free) -- open to everyone.
//   2. It's the signed-in player's "bonus" category (see getBonusCategory).
//   3. The player has unlocked everything today by sharing a result
//      (see markSharedUnlock) -- checked by the caller and passed in as
//      `sharedUnlock` rather than re-read here, so callers only touch
//      localStorage once per render.
export function canPlayCategory({ puzzle, bonusCategory, sharedUnlock }) {
  if (!puzzle) return false
  if (puzzle.is_free) return true
  if (sharedUnlock) return true
  return Boolean(bonusCategory) && puzzle.category === bonusCategory
}

// Small deterministic string hash -- no crypto needed, just needs to spread
// different (userId, date) pairs roughly evenly across `mod` buckets.
function hashToIndex(str, mod) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash % mod
}

// The one extra category a signed-in player can play today, on top of the
// day's free category -- a perk for signing up. Deterministic per
// (user, day) rather than re-rolled on every render/reload, so it doesn't
// jump around while they're mid-puzzle, but it does vary from player to
// player and day to day since both feed the hash. Needs no database write:
// it's a pure function of the user id and the UK calendar date, both of
// which the client already has.
export function getBonusCategory({ session, puzzleDate, freeCategory }) {
  if (!session) return null
  const others = CATEGORIES.filter((c) => c !== freeCategory)
  if (others.length === 0) return null
  return others[hashToIndex(`${session.user.id}-${puzzleDate}`, others.length)]
}

const SHARE_UNLOCK_KEY_PREFIX = 'initially_share_unlock_'

// Sharing a result unlocks every category for the *rest of that UK day*,
// on this browser -- same device-scoped, no-login-required model the free
// category itself already uses, so it works for signed-out players too.
export function hasSharedUnlock(puzzleDate) {
  return localStorage.getItem(SHARE_UNLOCK_KEY_PREFIX + puzzleDate) === '1'
}

export function markSharedUnlock(puzzleDate) {
  localStorage.setItem(SHARE_UNLOCK_KEY_PREFIX + puzzleDate, '1')
}
