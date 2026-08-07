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
      'Solved on guess three with zero hints used — sharp read. 🎯',
      'Three guesses in, no hints needed — nicely worked out. 💪',
    ],
    withHints: [
      'Three guesses in, hints and all — you got there. 🎉',
      'Guess three, a hint or two along the way — nice recovery. ✨',
    ],
  },
  4: {
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

// Loss copy is a lead-in plus a forward-looking close, picked independently
// so the caller can slot "the answer was X" and the fun fact between the two
// and still read as one flowing paragraph.
const LOSS_LEADS = [
  "So close! Today's one got away",
  'Not this time',
  'That one was a toughie',
  'Missed it by a whisker',
  'Tough break today',
]

// Shown when the player genuinely ran out of guesses — warmer and more
// encouraging than the "gave up" pool below.
const LOSS_CLOSERS = [
  "Tomorrow's puzzle is a clean slate. 🌅",
  "But you'll be back for the next one. 💪",
  'New puzzle, new shot, tomorrow. 🔄',
  'Come back tomorrow for a fresh start. ✨',
  "You'll get 'em tomorrow. 🎯",
]

// Shown when the player deliberately taps "Reveal Answer" instead of running
// out of guesses — funnier and more teasing than LOSS_CLOSERS, since this
// loss was a choice, not a defeat.
const GAVE_UP_CLOSERS = [
  'Giving up? Bold strategy. 🏳️',
  'Well, THAT was a valiant effort. Sort of. 😅',
  'Reader, they surrendered. 📖🏳️',
  'And thus, the streak died. Dramatic music plays. 🎻',
  "Fine, FINE. Here's the answer, you giver-upper. 😂",
  'The Oracle sighs and reveals all. Try harder tomorrow, champ. 🔮',
  'Giving up was apparently an option after all. 🙃',
  'White flag officially raised. 🏳️',
]

// Independent of guess/hint tier — a short celebratory closer shown as its
// own visual block underneath the win message + fun fact.
const WIN_CLOSERS = [
  "Come back tomorrow to keep the streak alive. 🔥",
  'See you tomorrow for the next one. 🎉',
  "That's a win in the books — tomorrow brings a fresh puzzle. ⭐",
  'Nicely played. Same time tomorrow? 🙌',
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
  const guessTier = Math.min(Math.max(attempts, 1), 4)
  const hintTier = hintsUsed === 0 ? 'noHints' : 'withHints'
  const pool = WIN_MESSAGES[guessTier][hintTier]
  return {
    message: pickFrom(`win-${guessTier}-${hintTier}`, pool),
    closer: pickFrom('win-closer', WIN_CLOSERS),
  }
}

// gaveUp: true when the player tapped "Reveal Answer" rather than running
// out of guesses — picks from the funnier GAVE_UP_CLOSERS pool instead of
// the warmer LOSS_CLOSERS one.
export function getLossMessage(gaveUp = false) {
  return {
    lead: pickFrom('loss-lead', LOSS_LEADS),
    tail: gaveUp
      ? pickFrom('gave-up-closer', GAVE_UP_CLOSERS)
      : pickFrom('loss-closer', LOSS_CLOSERS),
  }
}
