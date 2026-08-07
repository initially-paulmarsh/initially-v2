import { useEffect, useMemo, useState } from 'react'
import CategoryTabs from './components/CategoryTabs'
import PuzzleGrid from './components/PuzzleGrid'
import HintPanel from './components/HintPanel'
import GuessInput from './components/GuessInput'
import { CATEGORIES, fetchTodaysPuzzles } from './lib/dailyPuzzle'
import { isMatch } from './lib/fuzzyMatch'
import { MAX_GUESSES } from './lib/hints'
import { getWinMessage, getLossMessage } from './lib/messages'

function makeInitialGameState(puzzles) {
  const state = {}
  for (const category of CATEGORIES) {
    const puzzle = puzzles[category]
    if (puzzle) {
      state[category] = {
        lockedWords: Array(puzzle.word_count).fill(null),
        attempts: 0,
        status: 'playing',
        revealedHints: [false, false, false],
        resultMessage: null,
      }
    }
  }
  return state
}

function App() {
  const [puzzles, setPuzzles] = useState(null)
  const [gameState, setGameState] = useState({})
  const [activeCategory, setActiveCategory] = useState('movie')
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    fetchTodaysPuzzles()
      .then((data) => {
        setPuzzles(data)
        setGameState(makeInitialGameState(data))
        const firstAvailable = CATEGORIES.find((c) => data[c])
        if (firstAvailable) setActiveCategory(firstAvailable)
      })
      .catch((err) => setLoadError(err.message))
  }, [])

  const statusByCategory = useMemo(() => {
    const map = {}
    for (const category of CATEGORIES) {
      map[category] = gameState[category]?.status ?? 'playing'
    }
    return map
  }, [gameState])

  // Returns true if the guess left at least one word unsolved, so the input
  // knows whether to give shake feedback.
  function handleGuess(words) {
    const puzzle = puzzles[activeCategory]
    const current = gameState[activeCategory]
    if (!puzzle || !current || current.status !== 'playing') return false

    const correctWords = puzzle.title.split(' ')
    const lockedWords = current.lockedWords.map((locked, i) =>
      locked ? locked : isMatch(words[i], correctWords[i]) ? correctWords[i] : null,
    )
    const attempts = current.attempts + 1
    const allLocked = lockedWords.every(Boolean)
    const status = allLocked ? 'won' : attempts >= MAX_GUESSES ? 'lost' : 'playing'

    // Picked once at the moment the game resolves — not on every re-render —
    // so the message stays stable while the result panel is on screen.
    const resultMessage =
      status === 'won'
        ? getWinMessage(attempts, current.revealedHints.filter(Boolean).length)
        : status === 'lost'
          ? getLossMessage()
          : null

    setGameState((prev) => ({
      ...prev,
      [activeCategory]: { ...current, lockedWords, attempts, status, resultMessage },
    }))

    return !allLocked
  }

  function handleRevealHint(index) {
    setGameState((prev) => {
      const current = prev[activeCategory]
      if (!current) return prev
      const revealedHints = [...current.revealedHints]
      revealedHints[index] = true
      return { ...prev, [activeCategory]: { ...current, revealedHints } }
    })
  }

  if (loadError) {
    return (
      <Centered>
        <p className="text-rose-500">Couldn't load today's puzzles: {loadError}</p>
      </Centered>
    )
  }

  if (!puzzles) {
    return (
      <Centered>
        <p className="text-neutral-500 dark:text-neutral-400">Loading today's puzzles…</p>
      </Centered>
    )
  }

  const activePuzzle = puzzles[activeCategory]
  const activeGame = gameState[activeCategory]

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          INITIALLY
        </h1>
        <p className="mt-1.5 text-neutral-500 dark:text-neutral-400">
          Guess the title from its initials.
        </p>

        <div className="mt-7">
          <CategoryTabs
            categories={CATEGORIES.filter((c) => puzzles[c])}
            active={activeCategory}
            onSelect={setActiveCategory}
            statusByCategory={statusByCategory}
          />
        </div>

        {activePuzzle && activeGame ? (
          <div className="mt-9 w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <PuzzleGrid puzzle={activePuzzle} attempts={activeGame.attempts} status={activeGame.status} />

            {activeGame.status === 'playing' ? (
              <GuessInput
                key={activeCategory}
                wordCount={activePuzzle.word_count}
                lockedWords={activeGame.lockedWords}
                onSubmit={handleGuess}
                disabled={activeGame.status !== 'playing'}
              />
            ) : (
              <ResultPanel puzzle={activePuzzle} game={activeGame} />
            )}

            <HintPanel
              puzzle={activePuzzle}
              revealedHints={activeGame.revealedHints}
              onReveal={handleRevealHint}
            />
          </div>
        ) : (
          <p className="mt-8 text-neutral-500 dark:text-neutral-400">
            No puzzle available for this category today.
          </p>
        )}
      </div>
    </div>
  )
}

function ResultPanel({ puzzle, game }) {
  const won = game.status === 'won'
  const titleEl = (
    <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{puzzle.title}</strong>
  )

  return (
    <div
      className={`animate-fade-slide-in mt-8 w-full max-w-md rounded-xl border px-5 py-4 text-center ${
        won
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/70 dark:bg-emerald-950/30'
          : 'border-rose-200 bg-rose-50 dark:border-rose-900/70 dark:bg-rose-950/30'
      }`}
    >
      <p
        className={`text-base leading-relaxed font-medium ${
          won ? 'text-emerald-900 dark:text-emerald-200' : 'text-rose-900 dark:text-rose-200'
        }`}
      >
        {won ? (
          <>
            {game.resultMessage}
            {puzzle.fun_fact && ` ${puzzle.fun_fact}`}
          </>
        ) : (
          <>
            {game.resultMessage.lead} — the answer was {titleEl}.
            {puzzle.fun_fact && ` ${puzzle.fun_fact}`} {game.resultMessage.tail}
          </>
        )}
      </p>
    </div>
  )
}

function Centered({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      {children}
    </div>
  )
}

export default App
