export const MAX_GUESSES = 3

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

// Proverbs have no natural "creator" — falls back to the most distinctive
// word in the title instead (e.g. "worm" for "The early bird catches the
// worm"). Never the first word, to avoid trivializing the guess; prefers
// the last remaining content word, which tends to be the part that anchors
// the proverb's meaning/imagery.
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

// Exactly 3 hints, all player-revealed — no auto-unlock by guess count.
// Each reads from the puzzle's `hints` jsonb, which may be incomplete for a
// given puzzle — each falls back to a friendly "nothing extra" message.
export function getHintTiers(puzzle) {
  const hints = puzzle.hints ?? {}

  const metaLine = [hints.year, hints.genre].filter(Boolean).join(' · ')
  const finalLine = [hints.country, hints.decade].filter(Boolean).join(' · ')

  // seed data uses category-specific keys: "author" (book/proverb/movie
  // director), "artist" (song) — check both rather than forcing one.
  const creator = hints.author || hints.artist || hints.director
  const useWordFallback = !creator && puzzle.category === 'proverb'
  const wordHint = useWordFallback ? distinctiveWord(puzzle.title) : null

  return [
    {
      order: 1,
      label: 'Category details',
      value: metaLine || 'No extra detail for this one — trust your instinct.',
    },
    {
      order: 2,
      label: useWordFallback && wordHint ? 'Key word' : 'Creator',
      value:
        creator || wordHint ||
        'Unknown — no creator on record for this one.',
    },
    {
      order: 3,
      label: 'Final clue',
      value: finalLine || 'Nothing left to give — you have everything you need.',
    },
  ]
}
