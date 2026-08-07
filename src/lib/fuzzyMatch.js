const ARTICLES = new Set(['the', 'a', 'an'])

const ROMAN_TO_ARABIC = {
  i: '1', ii: '2', iii: '3', iv: '4', v: '5',
  vi: '6', vii: '7', viii: '8', ix: '9', x: '10',
}

function stripDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Lowercases, strips accents/punctuation, maps roman numerals ("II" -> "2"),
// and drops a leading article so "The Godfather Part II" and "godfather part 2"
// normalize to the same string.
function normalize(str) {
  const words = stripDiacritics(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ROMAN_TO_ARABIC[word] ?? word)

  if (words.length > 1 && ARTICLES.has(words[0])) {
    words.shift()
  }
  return words.join(' ')
}

function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  let curr = new Array(n + 1)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

export function similarity(guess, title) {
  const a = normalize(guess)
  const b = normalize(title)
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

// Tolerates case, punctuation, accents, article drops, and minor typos
// (~12% of normalized title length, minimum 1 char) without accepting
// genuinely wrong answers.
export function isMatch(guess, title) {
  const a = normalize(guess)
  const b = normalize(title)
  if (!a) return false
  if (a === b) return true

  const tolerance = Math.max(1, Math.round(b.length * 0.12))
  return levenshtein(a, b) <= tolerance
}
