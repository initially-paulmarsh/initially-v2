import { getHintTiers } from '../lib/hints'

function HintPanel({ puzzle, revealedHints, onReveal }) {
  const tiers = getHintTiers(puzzle)

  return (
    <div className="mt-8 w-full max-w-md space-y-2">
      {tiers.map((tier, i) => {
        const revealed = revealedHints[i]
        const locked = !revealed && i > 0 && !revealedHints[i - 1]
        return (
          <button
            key={tier.order}
            type="button"
            onClick={() => onReveal(i)}
            disabled={revealed || locked}
            className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200 ${
              revealed
                ? 'cursor-default border-amber-200 bg-amber-50 text-neutral-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-neutral-100'
                : locked
                  ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {revealed ? (
              <span className="animate-fade-slide-in flex flex-wrap items-baseline gap-x-2">
                <span className="text-gold dark:text-gold-light font-semibold">{tier.label}</span>
                <span>{tier.value}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 font-medium">
                <span aria-hidden="true">{locked ? '🔒' : '💡'}</span>
                Reveal Hint {tier.order}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default HintPanel
