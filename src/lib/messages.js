// Win copy is keyed by (guess number × hints used). A hint-free win reads as
// more impressive than a win with hints, even on the same guess — so each
// guess tier has a "noHints" pool (bigger flourish) and a "withHints" pool
// (softer framing). Each line names its own guess count and hint status
// (rather than a separate factual line) so it reads as one natural sentence
// when the caller appends the puzzle's fun fact straight after it.
const WIN_MESSAGES = {
  1: {
    noHints: [
      'Unbelievable — zero hints, first try. You just read my mind. 🤯',
      'No hints, first guess — certified genius. 🏆',
      "No hints, first guess — that wasn't luck, that was pure instinct. ⚡",
    ],
    withHints: [
      'First guess, hints and all — still nicely done. 🔥',
      'First guess, smart use of the hints — nailed it right away. 👏',
    ],
  },
  2: {
    noHints: [
      'Solved in two with zero hints — that was a tough one, seriously impressive! 🔥',
      'Solved cold in two, no hints used — seriously impressive. 💪',
    ],
    withHints: [
      'Solved in two, with a hint or two along the way — nice one! 🎉',
      'Two guesses, a couple of hints — smart use of the clues. ✨',
    ],
  },
  3: {
    noHints: [
      "Down to the last guess with zero hints — that's a nail-biter of a pure win! 😮‍💨🏆",
      'Cut it close on the final guess, but zero hints used — respect. 🎊',
    ],
    withHints: [
      'Down to the last guess with a few hints used — but you cut it close and pulled through! 😅🎉',
      'Last guess, hints and all — phew, you pulled through! 🎊',
    ],
  },
}

// Loss lines are split into a lead-in and a forward-looking close, so the
// caller can slot "the answer was X" and the fun fact between the two and
// still read as one flowing paragraph.
const LOSS_MESSAGES = [
  { lead: "So close! Today's one got away", tail: "Tomorrow's puzzle is a clean slate. 🌅" },
  { lead: 'Not this time', tail: "But you'll be back for the next one. 💪" },
  { lead: 'That one was a toughie', tail: 'New puzzle, new shot, tomorrow. 🔄' },
  { lead: 'Missed it by a whisker', tail: 'Come back tomorrow for a fresh start. ✨' },
  { lead: 'Tough break today', tail: "You'll get 'em tomorrow. 🎯" },
]

// Tracks the last message shown per matrix cell so the same line never
// repeats twice in a row within that cell.
const lastByKey = new Map()

function pickFrom(key, pool) {
  if (pool.length === 1) return pool[0]
  const last = lastByKey.get(key)
  let choice
  do {
    choice = pool[Math.floor(Math.random() * pool.length)]
  } while (choice === last)
  lastByKey.set(key, choice)
  return choice
}

export function getWinMessage(attempts, hintsUsed) {
  const guessTier = Math.min(Math.max(attempts, 1), 3)
  const hintTier = hintsUsed === 0 ? 'noHints' : 'withHints'
  const pool = WIN_MESSAGES[guessTier][hintTier]
  return pickFrom(`win-${guessTier}-${hintTier}`, pool)
}

export function getLossMessage() {
  return pickFrom('loss', LOSS_MESSAGES)
}
