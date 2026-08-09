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

// Ranks a title's words by how "distinctive" they are, most distinctive
// first — the raw material for the word-reveal fallback used across all
// categories (e.g. "worm" for "The early bird catches the worm"). Never the
// first word, to avoid trivializing the guess; prefers content words over
// grammatical ones, and within that, later words over earlier ones, since
// those tend to be the part that anchors a title's imagery/meaning.
function distinctiveWordCandidates(title) {
  const words = title
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z']/g, ''))
    .filter(Boolean)

  if (words.length <= 1) return words

  const rest = words.slice(1)
  const contentWords = rest.filter((w) => !STOPWORDS.has(w.toLowerCase()))
  const pool = contentWords.length ? contentWords : rest

  return [...pool].reverse()
}

function distinctiveWord(title) {
  return distinctiveWordCandidates(title)[0] ?? null
}

// Picks up to `count` distinct fallback words for a title, skipping
// case-insensitive repeats -- so when a puzzle needs two word-reveal
// fallbacks (e.g. both the origin and creator hints are missing), the two
// hints don't end up showing the same word twice.
function pickDistinctiveWords(title, count) {
  const picked = []
  const seen = new Set()
  for (const word of distinctiveWordCandidates(title)) {
    const key = word.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(word)
    if (picked.length === count) break
  }
  return picked
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
// given puzzle. Tiers 1 and 2 fall back to revealing a distinctive word from
// the title (same mechanism as the proverb "Key word" hint) when their
// field is missing, rather than a flat "no extra detail" message — tier 3
// keeps the plain fallback, since by then there's no real content left to
// substitute. If both tiers 1 and 2 need a fallback, they're given two
// different words (see pickDistinctiveWords) so hint 2 never just repeats
// hint 1.
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

  const needsOriginFallback = !originLine
  const needsCreatorFallback = !creator
  const fallbackWords = pickDistinctiveWords(
    puzzle.title,
    (needsOriginFallback ? 1 : 0) + (needsCreatorFallback ? 1 : 0),
  )
  let nextFallbackIndex = 0
  const originFallback = needsOriginFallback ? fallbackWords[nextFallbackIndex++] : null
  const creatorFallback = needsCreatorFallback ? fallbackWords[nextFallbackIndex++] : null

  return [
    {
      // Falls back to "Country & decade" wording (rather than "Key word")
      // when even a fallback word isn't available -- a title too short to
      // yield one -- so the label still matches the graceful message below.
      order: 1,
      label: originFallback ? 'Key word' : 'Country & decade',
      value: originLine || originFallback || 'No extra detail for this one — trust your instinct.',
    },
    {
      order: 2,
      label: creatorFallback ? 'Key word' : 'Creator',
      value: creator || creatorFallback || 'Unknown — no creator on record for this one.',
    },
    {
      order: 3,
      label: 'Category details',
      value: metaLine || 'Nothing left to give — you have everything you need.',
    },
  ]
}
