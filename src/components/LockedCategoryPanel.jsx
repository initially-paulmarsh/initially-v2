import { CATEGORY_LABEL } from '../lib/categoryTheme'
import LockIcon from './LockIcon'

// Two ways to open this one up, on top of the day's single free category
// (see lib/access.js): sign in for a bonus category, or finish and share a
// puzzle you can already play to unlock every category for the rest of the
// day. Whichever CTA is relevant depends only on whether they're signed in
// — a signed-in player always already has a bonus category assigned
// elsewhere, so this panel only ever renders for a category that's neither
// today's free one nor theirs.
function LockedCategoryPanel({ category, session, onSignIn }) {
  return (
    <div className="animate-fade-slide-in border-line bg-card mt-8 w-full max-w-md rounded-2xl border px-5 py-8 text-center">
      <LockIcon className="text-navy-soft mx-auto h-8 w-8" />
      <p className="text-navy mt-3 text-lg font-semibold">
        Today's {CATEGORY_LABEL[category]} puzzle is locked
      </p>

      {session ? (
        <p className="text-navy-soft mt-1 text-base leading-relaxed">
          Finish a puzzle you can already play and share your result to unlock every category for the
          rest of today.
        </p>
      ) : (
        <>
          <p className="text-navy-soft mt-1 text-base leading-relaxed">
            Sign in for a free bonus puzzle today, on top of the one everyone gets.
          </p>
          <button
            type="button"
            onClick={onSignIn}
            className="bg-gold text-navy mt-4 min-h-11 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:brightness-105"
          >
            Sign in for a bonus puzzle
          </button>
          <p className="text-navy-soft mt-3 text-sm leading-relaxed">
            Or finish a puzzle you can already play and share your result to unlock every category for
            the rest of today.
          </p>
        </>
      )}
    </div>
  )
}

export default LockedCategoryPanel
