import { CATEGORY_LABEL, CATEGORY_ICON } from '../lib/categoryTheme'
import LockIcon from './LockIcon'

// won/lost only -- "still playing" isn't worth a dot, nothing to report yet.
const STATUS_DOT = {
  won: 'bg-success',
  lost: 'bg-error',
}

function CategoryTabs({ categories, active, onSelect, statusByCategory, lockedCategories }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {categories.map((category) => {
        const isActive = category === active
        const status = statusByCategory[category] ?? 'playing'
        const isLocked = lockedCategories?.has(category)
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`text-navy flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-lg font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? 'border-gold bg-gold/12'
                : 'border-line bg-card hover:border-gold/50 hover:bg-gold/5'
            }`}
          >
            <span aria-hidden="true" className="text-xl">
              {CATEGORY_ICON[category]}
            </span>
            {CATEGORY_LABEL[category]}
            {isLocked && <LockIcon className="text-navy-soft h-4 w-4" />}
            {!isLocked && status !== 'playing' && (
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status]}`} />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryTabs
