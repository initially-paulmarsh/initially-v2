export const MAX_GUESSES = 4

// Purely grammatical function words — filtered out when picking a
// distinctive word from a title, since they're never the "meaningful" part.
// Deliberately keeps words like "never"/"all"/"not" (content-bearing even
// though short), unlike a typical stopword list.
const STOPWORDS = new Set([
  'a', 'an', 'the',
  'of', 'in', 'on', 'at', 'by', 'to', 'for', 'with', 'from',
  'into', 'onto', 'over', 'under', 'through', 'about', 'against', 'between', 'among',
  'and', 'or', 'but', 'if', 'then', 'than', 'so', 'because', 'as',
  'it', 'its', 'this', 'that', 'these', 'those',
  'you', 'your', 'he', 'she', 'they', 'we', 'i', 'who', 'what', 'when', 'where',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'has', 'have', 'had',
  'will', 'would', 'can', 'could', 'shall', 'should', 'may', 'might', 'must',
])

// The proverb "key word" hint — the most distinctive word in the title
// (e.g. "worm" for "The early bird catches the worm"). Never the first
// word, to avoid trivializing the guess; prefers the last remaining content
// word, which tends to be the part that anchors the proverb's imagery.
function distinctiveWord(title) {
  const words = title
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z']/g, ''))
    .filter(Boolean)

  if (words.length <= 1) return words[0] ?? null

  const rest = words.slice(1)
  const contentWords = rest.filter((w) => !STOPWORDS.has(w.toLowerCase()))
  const pool = contentWords.length ? contentWords : rest

  return pool[pool.length - 1]
}

// Proverbs use a bespoke 3-tier structure instead of the movie/song/book one
// below: they have no natural "creator" or release year, but do have a
// hand-written genre/theme tag and (for a growing subset) a `fun_hint` — a
// modern paraphrase or "used when…" example. Ordered vaguest-first: the
// theme narrows the least, the key word narrows a lot only once the player
// stares at it, and the fun hint is usually enough to nail it outright.
//
// Tier 3 is omitted entirely — rather than shown with placeholder text —
// for puzzles that don't have a `fun_hint` yet, since the batch covers only
// a subset of the proverb bank so far.
function getProverbHintTiers(puzzle) {
  const hints = puzzle.hints ?? {}
  const wordHint = distinctiveWord(puzzle.title)

  const tiers = [
    {
      order: 1,
      label: 'Theme',
      value: hints.genre || 'No theme on record for this one — trust your instinct.',
    },
    {
      order: 2,
      label: 'Key word',
      value: wordHint || 'No standout word to pull out here — you have everything you need.',
    },
  ]

  if (hints.fun_hint) {
    tiers.push({
      order: 3,
      label: 'Fun hint',
      value: hints.fun_hint,
    })
  }

  return tiers
}

// Exactly 3 hints, all player-revealed — no auto-unlock by guess count.
// Each reads from the puzzle's `hints` jsonb, which may be incomplete for a
// given puzzle — each falls back to a friendly "nothing extra" message.
//
// Ordered by difficulty, vaguest first: country+decade narrows the least,
// the creator narrows a lot only if the player recognizes the name, and
// exact year+genre — combined with the initials already on screen — is
// usually enough to nail it.
export function getHintTiers(puzzle) {
  if (puzzle.category === 'proverb') return getProverbHintTiers(puzzle)

  const hints = puzzle.hints ?? {}

  const metaLine = [hints.year, hints.genre].filter(Boolean).join(' · ')
  const originLine = [hints.country, hints.decade].filter(Boolean).join(' · ')

  // seed data uses category-specific keys: "author" (book/movie director),
  // "artist" (song) — check both rather than forcing one.
  const creator = hints.author || hints.artist || hints.director

  return [
    {
      order: 1,
      label: 'Country & decade',
      value: originLine || 'No extra detail for this one — trust your instinct.',
    },
    {
      order: 2,
      label: 'Creator',
      value: creator || 'Unknown — no creator on record for this one.',
    },
    {
      order: 3,
      label: 'Category details',
      value: metaLine || 'Nothing left to give — you have everything you need.',
    },
  ]
}
