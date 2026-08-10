import { useState } from 'react'
import { CATEGORIES } from '../lib/dailyPuzzle'
import { getAllLocalStats } from '../lib/stats'
import { CATEGORY_LABEL, CATEGORY_ICON } from '../lib/categoryTheme'
import ShareStatsButton from './ShareStatsButton'

function StatsPage({ onClose }) {
  // Snapshot on open rather than a live subscription -- this modal fully
  // remounts each time it's opened, so it always reflects the latest local
  // stats without needing to track updates while it's closed.
  const [stats] = useState(() => getAllLocalStats())

  return (
    <div
      className="animate-fade-slide-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Your Stats</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {CATEGORIES.map((category) => (
            <CategoryStats key={category} category={category} stats={stats[category]} />
          ))}
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <ShareStatsButton stats={stats} />
        </div>
      </div>
    </div>
  )
}

function CategoryStats({ category, stats }) {
  const winPct = stats.total_played > 0 ? Math.round((stats.total_won / stats.total_played) * 100) : 0

  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
        {CATEGORY_ICON[category]} {CATEGORY_LABEL[category]}
      </h3>

      {stats.total_played === 0 ? (
        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">No games played yet.</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <Stat label="Streak" value={stats.current_streak} />
            <Stat label="Max" value={stats.max_streak} />
            <Stat label="Played" value={stats.total_played} />
            <Stat label="Win %" value={`${winPct}%`} />
          </div>
          <GuessDistribution distribution={stats.guess_distribution} />
        </>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-lg font-extrabold text-neutral-900 dark:text-neutral-50">{value}</div>
      <div className="text-[10px] font-medium tracking-wide text-neutral-400 uppercase dark:text-neutral-500">
        {label}
      </div>
    </div>
  )
}

function GuessDistribution({ distribution }) {
  const entries = Object.entries(distribution).sort(([a], [b]) => Number(a) - Number(b))
  const maxCount = Math.max(1, ...entries.map(([, count]) => count))

  return (
    <div className="mt-3 space-y-1.5">
      {entries.map(([guess, count]) => (
        <div key={guess} className="flex items-center gap-2">
          <span className="w-3 shrink-0 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            {guess}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
            {count > 0 && (
              <div
                className="flex h-full min-w-6 items-center justify-end rounded bg-emerald-500 px-1.5 text-[11px] font-semibold text-white dark:bg-emerald-500"
                style={{ width: `${(count / maxCount) * 100}%` }}
              >
                {count}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsPage
