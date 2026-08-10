const CATEGORY_LABEL = { movie: 'Movie', proverb: 'Proverb', song: 'Song', book: 'Book' }

function LockedCategoryPanel({ category }) {
  return (
    <div className="animate-fade-slide-in mt-8 w-full max-w-md rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="text-3xl" aria-hidden="true">
        🔒
      </div>
      <p className="mt-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        Today's {CATEGORY_LABEL[category]} puzzle is subscriber-only
      </p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        Subscriptions aren't open yet — one free category unlocks daily until they launch.
      </p>
      <span className="mt-4 inline-block rounded-lg bg-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        🔒 Available with subscription (launching soon)
      </span>
    </div>
  )
}

export default LockedCategoryPanel
