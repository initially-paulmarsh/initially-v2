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
      className="animate-fade-slide-in fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-card max-h-full w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-navy text-xl font-bold">Your Stats</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-navy-soft hover:text-navy min-h-9 min-w-9 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {CATEGORIES.map((category) => (
            <CategoryStats key={category} category={category} stats={stats[category]} />
          ))}
        </div>

        <div className="border-line mt-6 border-t pt-4">
          <ShareStatsButton stats={stats} />
        </div>
      </div>
    </div>
  )
}

function CategoryStats({ category, stats }) {
  const winPct = stats.total_played > 0 ? Math.round((stats.total_won / stats.total_played) * 100) : 0

  return (
    <div className="border-line rounded-xl border p-4">
      <h3 className="text-navy flex items-center gap-2 text-base font-bold">
        <span aria-hidden="true" className="text-navy-soft text-lg">
          {CATEGORY_ICON[category]}
        </span>
        {CATEGORY_LABEL[category]}
      </h3>

      {stats.total_played === 0 ? (
        <p className="text-navy-soft mt-2 text-sm">No games played yet.</p>
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
      <div className="text-navy text-xl font-extrabold">{value}</div>
      <div className="text-navy-soft text-[10px] font-medium tracking-wide uppercase">{label}</div>
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
          <span className="text-navy-soft w-3 shrink-0 text-right text-xs font-semibold">{guess}</span>
          <div className="bg-ivory h-5 flex-1 overflow-hidden rounded">
            {count > 0 && (
              <div
                className="bg-success flex h-full min-w-6 items-center justify-end rounded px-1.5 text-[11px] font-semibold text-white"
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
