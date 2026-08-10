import { useEffect, useMemo, useState } from 'react'
import CategoryTabs from './components/CategoryTabs'
import PuzzleGrid from './components/PuzzleGrid'
import HintPanel from './components/HintPanel'
import GuessInput from './components/GuessInput'
import AuthModal from './components/AuthModal'
import StatsPage from './components/StatsPage'
import ShareButton from './components/ShareButton'
import LockedCategoryPanel from './components/LockedCategoryPanel'
import Logo from './components/Logo'
import { CATEGORIES, fetchTodaysPuzzles } from './lib/dailyPuzzle'
import { isMatch } from './lib/fuzzyMatch'
import { MAX_GUESSES } from './lib/hints'
import { getWinMessage, getLossMessage } from './lib/messages'
import { useSession, signOut } from './lib/auth'
import { recordCompletion, syncStatsOnSignIn } from './lib/stats'
import { canPlayCategory } from './lib/access'

// Set once the sign-in prompt has auto-opened, so it interrupts at most once
// per browser rather than re-popping after every puzzle completion.
const AUTH_PROMPT_KEY = 'initially_auth_prompted'

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
        guessHistory: [],
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
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const session = useSession()

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

  // Prompt for sign-in after the player's first puzzle completion (win or
  // loss) rather than on load, so they get a taste of the game before being
  // asked for an email — but only once per browser; a persistent header
  // link covers everyone who dismisses or misses that first prompt.
  useEffect(() => {
    if (session !== null) return
    if (localStorage.getItem(AUTH_PROMPT_KEY)) return
    const hasCompletedAny = Object.values(gameState).some((g) => g.status !== 'playing')
    if (hasCompletedAny) {
      setAuthModalOpen(true)
      localStorage.setItem(AUTH_PROMPT_KEY, '1')
    }
  }, [gameState, session])

  useEffect(() => {
    if (session) {
      setAuthModalOpen(false)
      syncStatsOnSignIn(session.user.id)
    }
  }, [session])

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
    if (!canPlayCategory({ session, puzzle })) return false

    const correctWords = puzzle.title.split(' ')
    const lockedWords = current.lockedWords.map((locked, i) =>
      locked ? locked : isMatch(words[i], correctWords[i]) ? correctWords[i] : null,
    )
    const attempts = current.attempts + 1
    const allLocked = lockedWords.every(Boolean)
    const status = allLocked ? 'won' : attempts >= MAX_GUESSES ? 'lost' : 'playing'
    // One row per guess, true per word position once it's locked-in correct
    // (whether solved this row or already locked from an earlier one) — the
    // raw material for the share-result emoji grid.
    const guessHistory = [...current.guessHistory, lockedWords.map(Boolean)]

    // Picked once at the moment the game resolves — not on every re-render —
    // so the message stays stable while the result panel is on screen.
    const resultMessage =
      status === 'won'
        ? getWinMessage(attempts, current.revealedHints.filter(Boolean).length)
        : status === 'lost'
          ? getLossMessage()
          : null

    if (status !== 'playing') {
      recordCompletion({
        category: activeCategory,
        won: status === 'won',
        guessesUsed: attempts,
        dailyPuzzleId: puzzle.daily_puzzle_id,
        userId: session?.user?.id,
      })
    }

    setGameState((prev) => ({
      ...prev,
      [activeCategory]: { ...current, lockedWords, attempts, status, resultMessage, guessHistory },
    }))

    return !allLocked
  }

  function handleRevealHint(index) {
    if (!canPlayCategory({ session, puzzle: puzzles[activeCategory] })) return
    setGameState((prev) => {
      const current = prev[activeCategory]
      if (!current) return prev
      if (index > 0 && !current.revealedHints[index - 1]) return prev
      const revealedHints = [...current.revealedHints]
      revealedHints[index] = true
      return { ...prev, [activeCategory]: { ...current, revealedHints } }
    })
  }

  // Deliberately giving up ends the puzzle as a loss, same as running out of
  // guesses — but with its own funnier closer line (see getLossMessage).
  function handleRevealAnswer() {
    const puzzle = puzzles[activeCategory]
    const current = gameState[activeCategory]
    if (!current || current.status !== 'playing') return
    if (!canPlayCategory({ session, puzzle })) return

    recordCompletion({
      category: activeCategory,
      won: false,
      guessesUsed: current.attempts,
      dailyPuzzleId: puzzle?.daily_puzzle_id,
      userId: session?.user?.id,
    })

    setGameState((prev) => ({
      ...prev,
      [activeCategory]: { ...current, status: 'lost', resultMessage: getLossMessage(true) },
    }))
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
  const canPlay = canPlayCategory({ session, puzzle: activePuzzle })
  const lockedCategories = new Set(
    CATEGORIES.filter((c) => puzzles[c] && !canPlayCategory({ session, puzzle: puzzles[c] })),
  )

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <h1 className="text-gold dark:text-gold-light text-4xl font-extrabold tracking-tight">INITIALLY</h1>
        </div>
        <p className="mt-1.5 text-neutral-500 dark:text-neutral-400">
          Guess the title from its initials.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          {session === null && (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="text-gold dark:text-gold-light text-xs font-semibold underline decoration-dotted underline-offset-4 transition-colors hover:opacity-80"
            >
              Sign in to save your streak
            </button>
          )}
          {session && (
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              {session.user.email} · Sign out
            </button>
          )}
          <button
            type="button"
            onClick={() => setStatsOpen(true)}
            className="text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            📊 Stats
          </button>
        </div>

        {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        {statsOpen && <StatsPage onClose={() => setStatsOpen(false)} />}

        <div className="mt-7">
          <CategoryTabs
            categories={CATEGORIES.filter((c) => puzzles[c])}
            active={activeCategory}
            onSelect={setActiveCategory}
            statusByCategory={statusByCategory}
            lockedCategories={lockedCategories}
          />
        </div>

        {activePuzzle && activeGame ? (
          !canPlay ? (
            <LockedCategoryPanel category={activeCategory} />
          ) : (
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

              {activeGame.status === 'playing' && (
                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={handleRevealAnswer}
                    className="text-xs font-medium text-neutral-400 underline decoration-dotted underline-offset-4 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                  >
                    Reveal Answer
                  </button>
                </div>
              )}
            </div>
          )
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
  const meaning = puzzle.category === 'proverb' ? puzzle.hints?.meaning : null

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
            {game.resultMessage.message}
            {puzzle.fun_fact && ` ${puzzle.fun_fact}`}
          </>
        ) : (
          <>
            {game.resultMessage.lead} — the answer was {titleEl}.
            {puzzle.fun_fact && ` ${puzzle.fun_fact}`}
          </>
        )}
      </p>

      {meaning && (
        <p
          className={`mt-2 text-sm leading-relaxed italic ${
            won ? 'text-emerald-800/90 dark:text-emerald-300/90' : 'text-rose-800/90 dark:text-rose-300/90'
          }`}
        >
          Meaning: {meaning}
        </p>
      )}

      <p
        className={`mt-3 border-t pt-3 text-sm font-bold ${
          won
            ? 'border-emerald-200 text-emerald-600 dark:border-emerald-900/70 dark:text-emerald-300'
            : 'border-rose-200 text-rose-600 dark:border-rose-900/70 dark:text-rose-400'
        }`}
      >
        {won ? game.resultMessage.closer : game.resultMessage.tail}
      </p>

      <ShareButton puzzle={puzzle} game={game} />
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
