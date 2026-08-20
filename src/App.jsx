import { useEffect, useMemo, useState } from 'react'
import CategoryTabs from './components/CategoryTabs'
import PuzzleGrid from './components/PuzzleGrid'
import HintPanel from './components/HintPanel'
import GuessInput from './components/GuessInput'
import AuthModal from './components/AuthModal'
import NotificationOptIn from './components/NotificationOptIn'
import StatsPage from './components/StatsPage'
import ShareButton from './components/ShareButton'
import LockedCategoryPanel from './components/LockedCategoryPanel'
import logoWordmark from './assets/logo-wordmark.webp'
import { CATEGORIES, fetchTodaysPuzzles } from './lib/dailyPuzzle'
import { isMatch } from './lib/fuzzyMatch'
import { MAX_GUESSES } from './lib/hints'
import { getWinMessage, getLossMessage } from './lib/messages'
import { useSession, signOut } from './lib/auth'
import { recordCompletion, syncStatsOnSignIn } from './lib/stats'
import { canPlayCategory } from './lib/access'
import {
  isNativePlatform,
  hasBeenPromptedForNotifications,
  markNotificationsPrompted,
  rescheduleIfAlreadyGranted,
} from './lib/notifications'

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
  const [notifModalOpen, setNotifModalOpen] = useState(false)
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

  // Only relevant inside the native iOS shell — offer a daily reminder
  // opt-in after the player's first puzzle completion, same trigger as the
  // sign-in prompt above but gated on that one being closed first so the two
  // never stack. A soft in-app ask (rather than firing the OS permission
  // dialog immediately) means a "no thanks" here costs nothing, whereas a
  // real OS denial can only be undone by the player in Settings.
  useEffect(() => {
    if (!isNativePlatform()) return
    if (authModalOpen) return
    if (hasBeenPromptedForNotifications()) return
    const hasCompletedAny = Object.values(gameState).some((g) => g.status !== 'playing')
    if (hasCompletedAny) {
      setNotifModalOpen(true)
      markNotificationsPrompted()
    }
  }, [gameState, authModalOpen])

  // Returning player who already granted permission earlier — re-roll
  // today's reminder copy. Never prompts; only touches an already-granted
  // permission.
  useEffect(() => {
    if (isNativePlatform()) rescheduleIfAlreadyGranted()
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
        <p className="text-error text-lg">Couldn't load today's puzzles: {loadError}</p>
      </Centered>
    )
  }

  if (!puzzles) {
    return (
      <Centered>
        <p className="text-navy-soft text-lg">Loading today's puzzles…</p>
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
    <div className="bg-ivory min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="flex w-full items-center justify-end gap-4">
          {session === null && (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="text-navy-soft hover:text-navy min-h-9 text-sm font-medium underline decoration-dotted underline-offset-4 transition-colors"
            >
              Sign in
            </button>
          )}
          {session && (
            <button
              type="button"
              onClick={() => signOut()}
              className="text-navy-soft hover:text-navy min-h-9 text-sm font-medium transition-colors"
            >
              {session.user.email} · Sign out
            </button>
          )}
          <button
            type="button"
            onClick={() => setStatsOpen(true)}
            className="text-navy-soft hover:text-navy min-h-9 text-sm font-medium transition-colors"
          >
            Stats
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <img
            src={logoWordmark}
            alt="INITIALLY — guess the title from its initials"
            className="h-auto w-full max-w-md"
          />
        </div>

        {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        {notifModalOpen && <NotificationOptIn onClose={() => setNotifModalOpen(false)} />}
        {statsOpen && <StatsPage onClose={() => setStatsOpen(false)} />}

        <div className="mt-7 w-full">
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
            <div className="border-line bg-card mt-8 w-full rounded-2xl border p-4 shadow-sm sm:p-8">
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
                    className="text-navy-soft hover:text-navy min-h-9 text-sm font-medium underline decoration-dotted underline-offset-4 transition-colors"
                  >
                    Reveal Answer
                  </button>
                </div>
              )}
            </div>
          )
        ) : (
          <p className="text-navy-soft mt-8 text-base">No puzzle available for this category today.</p>
        )}
      </div>
    </div>
  )
}

function ResultPanel({ puzzle, game }) {
  const won = game.status === 'won'
  const meaning = puzzle.category === 'proverb' ? puzzle.hints?.meaning : null
  const statusLabel = won ? 'Solved!' : 'Answer revealed'

  return (
    <div className="animate-fade-slide-in border-line bg-ivory mt-8 w-full max-w-md rounded-2xl border p-6 text-center">
      <p className="text-success flex items-center justify-center gap-1.5 text-sm font-bold tracking-wide uppercase">
        <span aria-hidden="true">✓</span> {statusLabel}
      </p>

      <p className="text-navy mt-2 text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
        {puzzle.title}
      </p>

      {puzzle.fun_fact && (
        <p className="text-navy-soft mt-3 text-base leading-relaxed">{puzzle.fun_fact}</p>
      )}

      {meaning && <p className="text-navy-soft mt-2 text-sm leading-relaxed italic">Meaning: {meaning}</p>}

      <div className="border-gold/30 bg-gold/8 mt-4 rounded-xl border px-4 py-3">
        <p className="text-navy text-sm leading-relaxed">
          {won ? game.resultMessage.message : game.resultMessage.lead}
        </p>
        <p className="text-navy mt-1 text-sm leading-relaxed font-semibold">
          {won ? game.resultMessage.closer : game.resultMessage.tail}
        </p>
      </div>

      <ShareButton puzzle={puzzle} game={game} />
    </div>
  )
}

function Centered({ children }) {
  return <div className="bg-ivory flex min-h-screen items-center justify-center">{children}</div>
}

export default App
