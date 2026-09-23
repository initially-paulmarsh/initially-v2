import { CATEGORIES } from './dailyPuzzle'
import { MAX_GUESSES } from './hints'
import { CATEGORY_LABEL, CATEGORY_ICON } from './categoryTheme'

// guessHistory: one row per submitted guess, each row a boolean per word
// position (true once that position is locked-in correct, whether newly
// solved on that row or already locked from an earlier one) -- the same
// "green stays green" convention Wordle's own share grid uses. Never
// touches the actual title, so the answer isn't spoiled for whoever reads it.
// Ends with the player's invite link (see lib/profile.js) -- the whole point
// of a share is that whoever reads it can tap straight into today's puzzle,
// and a friend who signs up through it unlocks a category for the sharer.
export function buildResultShareText({ category, status, guessHistory, puzzleDate, link }) {
  const scoreLine = status === 'won' ? `${guessHistory.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`
  const grid = guessHistory.map((row) => row.map((correct) => (correct ? '🟩' : '⬜')).join('')).join('\n')

  return [
    `INITIALLY ${CATEGORY_ICON[category]} ${CATEGORY_LABEL[category]} — ${puzzleDate}`,
    scoreLine,
    grid,
    '',
    `Can you beat me? Play free: ${link}`,
  ].join('\n')
}

// For inviting friends outside a result -- from a locked category or the
// leaderboard, before the player has anything to brag about.
export function buildInviteText(link) {
  return `Guess the movie, song, book or proverb from its initials — a new puzzle every day. Play free with me on INITIALLY: ${link}`
}

export function buildStatsShareText(stats, link) {
  const played = CATEGORIES.filter((category) => stats[category]?.total_played > 0)

  if (played.length === 0) {
    return `INITIALLY — My Stats 📊\nNo puzzles played yet — today's a good day to start a streak. 🧩\n\n${link}`
  }

  const lines = ['INITIALLY — My Stats 📊', '']
  for (const category of played) {
    const s = stats[category]
    const winPct = Math.round((s.total_won / s.total_played) * 100)
    lines.push(
      `${CATEGORY_ICON[category]} ${CATEGORY_LABEL[category]}: 🔥${s.current_streak} streak · ${winPct}% win rate (${s.total_played} played)`,
    )
  }
  lines.push('', `Can you beat me? Play free: ${link}`)
  return lines.join('\n')
}
