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
            className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-neutral-300 text-xl font-bold text-neutral-800 shadow-sm dark:border-neutral-600 dark:text-neutral-100"
          >
            {letter}
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
        {status === 'playing'
          ? `${remaining} guess${remaining === 1 ? '' : 'es'} left`
          : status === 'won'
            ? 'Solved!'
            : 'Out of guesses'}
      </p>
    </div>
  )
}

export default PuzzleGrid
