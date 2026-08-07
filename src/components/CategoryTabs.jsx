const LABELS = {
  movie: 'Movie',
  proverb: 'Proverb',
  song: 'Song',
  book: 'Book',
}

const STATUS_DOT = {
  won: 'bg-emerald-500',
  lost: 'bg-rose-500',
  playing: 'bg-neutral-300 dark:bg-neutral-600',
}

function CategoryTabs({ categories, active, onSelect, statusByCategory }) {
  return (
    <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
      {categories.map((category) => {
        const isActive = category === active
        const status = statusByCategory[category] ?? 'playing'
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
            {LABELS[category]}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryTabs
