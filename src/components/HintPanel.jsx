import { getHintTiers } from '../lib/hints'
import LockIcon from './LockIcon'

function HintPanel({ puzzle, revealedHints, onReveal }) {
  const tiers = getHintTiers(puzzle)

  return (
    <div className="mt-8 w-full max-w-md space-y-2.5">
      {tiers.map((tier, i) => {
        const revealed = revealedHints[i]
        const locked = !revealed && i > 0 && !revealedHints[i - 1]
        return (
          <button
            key={tier.order}
            type="button"
            onClick={() => onReveal(i)}
            disabled={revealed || locked}
            className={`min-h-12 w-full rounded-xl border-2 px-4 py-3 text-left text-base transition-colors duration-200 ${
              revealed
                ? 'border-gold/40 bg-gold/8 text-navy cursor-default'
                : locked
                  ? 'border-line bg-ivory text-navy-soft cursor-not-allowed opacity-70'
                  : 'border-line bg-card text-navy-soft hover:border-gold/50 hover:bg-gold/5'
            }`}
          >
            {revealed ? (
              <span className="animate-fade-slide-in flex flex-wrap items-baseline gap-x-2">
                <span className="text-navy font-semibold">{tier.label}</span>
                <span>{tier.value}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 font-medium">
                {locked && <LockIcon className="h-4 w-4" />}
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
