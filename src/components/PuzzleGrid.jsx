import { MAX_GUESSES } from '../lib/hints'

function PuzzleGrid({ puzzle, attempts, status }) {
  const initials = puzzle.initials.split(' ')
  const remaining = MAX_GUESSES - attempts

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-wrap justify-center gap-3">
        {initials.map((letter, i) => (
          <div
            key={i}
            className="text-navy flex h-16 w-16 items-center justify-center rounded-xl border-2 border-gold/50 bg-card text-3xl font-bold shadow-sm"
          >
            {letter}
          </div>
        ))}
      </div>

      <p
        className={`mt-4 text-center text-base font-medium ${
          status === 'won'
            ? 'text-success'
            : status === 'lost'
              ? 'text-error'
              : 'text-navy-soft'
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
