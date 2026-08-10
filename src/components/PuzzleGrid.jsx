import { MAX_GUESSES } from '../lib/hints'

function PuzzleGrid({ puzzle, attempts, status }) {
  const initials = puzzle.initials.split(' ')
  const remaining = MAX_GUESSES - attempts

  return (
    <div className="w-full max-w-md">
      {/* grow-0 + shrink + a basis (not a fixed width) means these compress
          together to whatever fits in one row instead of wrapping -- a
          title with more words just gets smaller tiles, on any screen,
          rather than risking a fixed px size that's wrong for some device
          or font-size setting. */}
      <div className="flex justify-center gap-1 sm:gap-3">
        {initials.map((letter, i) => (
          <div
            key={i}
            className="text-navy aspect-square min-w-0 shrink grow-0 basis-10 overflow-hidden rounded-md border-2 border-gold/50 bg-card text-sm font-bold shadow-sm sm:basis-16 sm:rounded-xl sm:text-3xl"
          >
            <div className="flex h-full w-full items-center justify-center">{letter}</div>
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
