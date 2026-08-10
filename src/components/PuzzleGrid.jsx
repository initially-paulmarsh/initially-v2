import { MAX_GUESSES } from '../lib/hints'

function PuzzleGrid({ puzzle, attempts, status }) {
  const initials = puzzle.initials.split(' ')
  const remaining = MAX_GUESSES - attempts

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-wrap justify-center gap-2">
        {initials.map((letter, i) => (
          <div
            key={i}
            className="text-gold dark:text-gold-light flex h-12 w-12 items-center justify-center rounded-lg border-2 border-amber-200 bg-amber-50 text-xl font-bold shadow-sm dark:border-amber-900/50 dark:bg-neutral-900"
          >
            {letter}
          </div>
        ))}
      </div>

      <p
        className={`mt-3 text-center text-sm font-medium ${
          status === 'won'
            ? 'text-emerald-600 dark:text-emerald-400'
            : status === 'lost'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        {status === 'playing'
          ? `${remaining} guess${remaining === 1 ? '' : 'es'} left`
          : status === 'won'
            ? 'Solved!'
            : remaining <= 0
              ? 'Out of guesses'
              : 'Answer revealed'}
      </p>
    </div>
  )
}

export default PuzzleGrid
