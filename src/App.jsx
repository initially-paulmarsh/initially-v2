import { useEffect, useMemo, useState } from 'react'
import CategoryTabs from './components/CategoryTabs'
import PuzzleGrid from './components/PuzzleGrid'
import HintPanel from './components/HintPanel'
import GuessInput from './components/GuessInput'
import AuthModal from './components/AuthModal'
import AccountModal from './components/AccountModal'
import NotificationOptIn from './components/NotificationOptIn'
import StatsPage from './components/StatsPage'
import ShareButton from './components/ShareButton'
import LockedCategoryPanel from './components/LockedCategoryPanel'
import LeaderboardPage from './components/LeaderboardPage'
import Wordmark from './components/Wordmark'
import LogoMark from './components/LogoMark'
import FeedbackModal from './components/FeedbackModal'
import { CATEGORIES, fetchTodaysPuzzles } from './lib/dailyPuzzle'
import { isMatch } from './lib/fuzzyMatch'
import { MAX_GUESSES } from './lib/hints'
import { getWinMessage, getLossMessage } from './lib/messages'
import { useSession } from './lib/auth'
import { recordCompletion, syncStatsOnSignIn } from './lib/stats'
import { canPlayCategory, unspentUnlocks } from './lib/access'
import { captureInviteFromUrl, claimPendingInvite, useProfile } from './lib/profile'
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
  const [accountOpen, setAccountOpen] = useState(false)
  const [notifModalOpen, setNotifModalOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const session = useSession()
  const { profile, refresh: refreshProfile } = useProfile(session)

  // Before anything else reads the URL: hold onto an ?invite= code from a
  // shared link until this visitor signs in (see claimPendingInvite).
  useEffect(() => {
    captureInviteFromUrl()
  }, [])

  useEffect(() => {
    fetchTodaysPuzzles()
      .then((data) => {
        setPuzzles(data)
        setGameState(makeInitialGameState(data))
        // Open on today's free puzzle, so a first-time visitor from a shared
        // link lands on something they can play rather than a lock.
        const firstAvailable = CATEGORIES.find((c) => data[c]?.is_free) ?? CATEGORIES.find((c) => data[c])
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
      // Credits whoever invited this (brand-new) player; a no-op for
      // returning players. The inviter sees it on their next profile load.
      claimPendingInvite().then(refreshProfile)
    }
  }, [session, refreshProfile])

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
    if (!canPlayCategory({ puzzle, profile })) return false

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
    if (!canPlayCategory({ puzzle: puzzles[activeCategory], profile })) return
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
    if (!canPlayCategory({ puzzle, profile })) return

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
  const canPlay = canPlayCategory({ puzzle: activePuzzle, profile })
  const lockedCategories = new Set(
    CATEGORIES.filter((c) => puzzles[c] && !canPlayCategory({ puzzle: puzzles[c], profile })),
  )

  return (
    <div className="bg-ivory min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Logo centred between Account (left) and Leaderboard (right),
            with Feedback and Stats at the foot of the page. Labelled,
            full-size buttons rather than small links, since much of this
            audience plays with larger text and less precise taps. */}
        <header className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="justify-self-start">
            <NavButton icon="👤" onClick={() => (session ? setAccountOpen(true) : setAuthModalOpen(true))}>
              {session ? 'Account' : 'Sign in'}
            </NavButton>
          </div>
          <LogoMark className="h-28 w-28 sm:h-32 sm:w-32" />
          <div className="justify-self-end">
            <NavButton icon="🏆" onClick={() => setLeaderboardOpen(true)}>
              Leaderboard
            </NavButton>
          </div>
        </header>

        <div className="mt-1 flex w-full flex-col items-center">
          <Wordmark />
        </div>

        {unspentUnlocks(profile) > 0 && (
          <p className="animate-fade-slide-in border-gold/40 bg-gold/10 text-navy mt-5 w-full rounded-xl border px-4 py-3 text-center text-base leading-relaxed">
            🎉 A friend joined through your link! Tap a locked category to unlock it forever.
          </p>
        )}

        {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        {accountOpen && session && (
          <AccountModal
            email={session.user.email}
            profile={profile}
            onProfileChanged={refreshProfile}
            onClose={() => setAccountOpen(false)}
          />
        )}
        {notifModalOpen && <NotificationOptIn onClose={() => setNotifModalOpen(false)} />}
        {statsOpen && <StatsPage profile={profile} onClose={() => setStatsOpen(false)} />}
        {feedbackOpen && <FeedbackModal session={session} onClose={() => setFeedbackOpen(false)} />}
        {leaderboardOpen && (
          <LeaderboardPage
            session={session}
            profile={profile}
            onProfileChanged={refreshProfile}
            onSignIn={() => {
              setLeaderboardOpen(false)
              setAuthModalOpen(true)
            }}
            onClose={() => setLeaderboardOpen(false)}
          />
        )}

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
            <LockedCategoryPanel
              category={activeCategory}
              session={session}
              profile={profile}
              onSignIn={() => setAuthModalOpen(true)}
              onUnlocked={refreshProfile}
            />
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
                <ResultPanel
                  puzzle={activePuzzle}
                  game={activeGame}
                  profile={profile}
                  signedIn={Boolean(session)}
                  onSignIn={() => setAuthModalOpen(true)}
                />
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
                    className="text-navy-soft hover:text-navy min-h-9 text-base font-medium underline decoration-dotted underline-offset-4 transition-colors"
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

        <footer className="mt-8 flex w-full items-center justify-between gap-2">
          <NavButton icon="💬" onClick={() => setFeedbackOpen(true)}>
            Feedback
          </NavButton>
          <NavButton icon="📊" onClick={() => setStatsOpen(true)}>
            Stats
          </NavButton>
        </footer>
      </div>
    </div>
  )
}

function ResultPanel({ puzzle, game, profile, signedIn, onSignIn }) {
  const won = game.status === 'won'
  const meaning = puzzle.category === 'proverb' ? puzzle.hints?.meaning : null
  const statusLabel = won ? 'Solved!' : 'Answer revealed'

  return (
    <div className="animate-fade-slide-in border-line bg-ivory mt-8 w-full max-w-md rounded-2xl border p-6 text-center">
      <p className="text-success flex items-center justify-center gap-1.5 text-base font-bold tracking-wide uppercase">
        <span aria-hidden="true">✓</span> {statusLabel}
      </p>

      <p className="text-navy mt-2 text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
        {puzzle.title}
      </p>

      {puzzle.fun_fact && (
        <p className="text-navy-soft mt-3 text-base leading-relaxed">{puzzle.fun_fact}</p>
      )}

      {meaning && <p className="text-navy-soft mt-2 text-base leading-relaxed italic">Meaning: {meaning}</p>}

      <div className="border-gold/30 bg-gold/8 mt-4 rounded-xl border px-4 py-3">
        <p className="text-navy text-base leading-relaxed">
          {won ? game.resultMessage.message : game.resultMessage.lead}
        </p>
        <p className="text-navy mt-1 text-base leading-relaxed font-semibold">
          {won ? game.resultMessage.closer : game.resultMessage.tail}
        </p>
      </div>

      <ShareButton puzzle={puzzle} game={game} profile={profile} signedIn={signedIn} onSignIn={onSignIn} />
    </div>
  )
}

// Icon above label, so the header corners stay narrow enough to share a row
// with the logo on the smallest iPhones.
function NavButton({ icon, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-line bg-card text-navy hover:border-gold/60 hover:bg-gold/5 flex min-h-16 min-w-20 flex-col items-center justify-center gap-0.5 rounded-xl border px-2.5 py-2 text-base font-semibold whitespace-nowrap transition-colors"
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {icon}
      </span>
      {children}
    </button>
  )
}

function Centered({ children }) {
  return <div className="bg-ivory flex min-h-screen items-center justify-center">{children}</div>
}

export default App
