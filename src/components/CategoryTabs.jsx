import { CATEGORY_LABEL, CATEGORY_ICON } from '../lib/categoryTheme'

// won/lost only -- "still playing" isn't worth a dot, nothing to report yet.
const STATUS_DOT = {
  won: 'bg-emerald-500',
  lost: 'bg-rose-500',
}

function CategoryTabs({ categories, active, onSelect, statusByCategory, lockedCategories }) {
  return (
    <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
      {categories.map((category) => {
        const isActive = category === active
        const status = statusByCategory[category] ?? 'playing'
        const isLocked = lockedCategories?.has(category)
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'text-gold dark:text-gold-light bg-amber-100 shadow-sm dark:bg-amber-950/40'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            } ${isLocked && !isActive ? 'opacity-60' : ''}`}
          >
            <span aria-hidden="true">{CATEGORY_ICON[category]}</span>
            {CATEGORY_LABEL[category]}
            {isLocked ? (
              <span aria-hidden="true" className="text-[10px] leading-none">
                🔒
              </span>
            ) : (
              status !== 'playing' && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryTabs
