import { CATEGORY_LABEL } from '../lib/categoryTheme'
import LockIcon from './LockIcon'

function LockedCategoryPanel({ category }) {
  return (
    <div className="animate-fade-slide-in border-line bg-card mt-8 w-full max-w-md rounded-2xl border px-5 py-8 text-center">
      <LockIcon className="text-navy-soft mx-auto h-8 w-8" />
      <p className="text-navy mt-3 text-lg font-semibold">
        Today's {CATEGORY_LABEL[category]} puzzle is subscriber-only
      </p>
      <p className="text-navy-soft mt-1 text-base leading-relaxed">
        Subscriptions aren't open yet — one free category unlocks daily until they launch.
      </p>
      <span className="border-line bg-ivory text-navy-soft mt-4 inline-block rounded-xl border px-5 py-2.5 text-sm font-semibold">
        Available with subscription (launching soon)
      </span>
    </div>
  )
}

export default LockedCategoryPanel
