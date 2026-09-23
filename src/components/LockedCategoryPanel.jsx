import { useState } from 'react'
import { CATEGORY_LABEL } from '../lib/categoryTheme'
import { FRIENDS_FOR_ALL_CATEGORIES, unspentUnlocks } from '../lib/access'
import { buildInviteText } from '../lib/share'
import { inviteLink, unlockCategory } from '../lib/profile'
import LockIcon from './LockIcon'
import ShareActions from './ShareActions'

// Shown in place of a category the player can't play today. Three states:
//   - signed out: sign in first, since only a signed-in player's invite
//     link can be credited;
//   - signed in with an unspent unlock (a friend joined): unlock this one
//     for good, right here;
//   - signed in otherwise: invite friends, with progress towards "all".
function LockedCategoryPanel({ category, session, profile, onSignIn, onUnlocked }) {
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState(null)
  const label = CATEGORY_LABEL[category]
  const friends = profile?.invite_count ?? 0

  async function handleUnlock() {
    setUnlocking(true)
    setError(null)
    const { error } = await unlockCategory(category)
    setUnlocking(false)
    if (error) setError(error.message)
    else onUnlocked()
  }

  return (
    <div className="animate-fade-slide-in border-line bg-card mt-8 w-full max-w-md rounded-2xl border px-5 py-8 text-center">
      <LockIcon className="text-navy-soft mx-auto h-8 w-8" />
      <p className="text-navy mt-3 text-lg font-semibold">Today's {label} puzzle is locked</p>

      {!session ? (
        <>
          <p className="text-navy-soft mt-1 text-base leading-relaxed">
            Invite friends to unlock it. Every friend who joins unlocks a category for you — forever.{' '}
            {FRIENDS_FOR_ALL_CATEGORIES} friends unlocks them all.
          </p>
          <button
            type="button"
            onClick={onSignIn}
            className="bg-gold text-navy mt-4 min-h-11 rounded-xl px-6 py-2.5 text-base font-semibold shadow-sm transition-all hover:shadow-md hover:brightness-105"
          >
            Sign in to get your invite link
          </button>
        </>
      ) : unspentUnlocks(profile) > 0 ? (
        <>
          <p className="text-navy-soft mt-1 text-base leading-relaxed">
            A friend joined through your link — you've earned an unlock. Use it on {label}?
          </p>
          {error && <p className="text-error mt-2 text-base">{error}</p>}
          <button
            type="button"
            onClick={handleUnlock}
            disabled={unlocking}
            className="bg-gold text-navy mt-4 min-h-11 rounded-xl px-6 py-2.5 text-base font-semibold shadow-sm transition-all hover:enabled:shadow-md hover:enabled:brightness-105 disabled:opacity-40"
          >
            {unlocking ? 'Unlocking…' : `Unlock ${label} forever`}
          </button>
        </>
      ) : (
        <>
          <p className="text-navy-soft mt-1 text-base leading-relaxed">
            Every friend who joins through your link unlocks a category for you — forever.{' '}
            {FRIENDS_FOR_ALL_CATEGORIES} friends unlocks them all.
          </p>
          <InviteProgress friends={friends} />
          <ShareActions
            className="mx-auto mt-4 max-w-xs"
            getText={() => buildInviteText(inviteLink(profile?.invite_code))}
            whatsAppLabel="Invite on WhatsApp"
          />
        </>
      )}
    </div>
  )
}

function InviteProgress({ friends }) {
  return (
    <div className="mt-4">
      <div className="flex justify-center gap-2" aria-hidden="true">
        {Array.from({ length: FRIENDS_FOR_ALL_CATEGORIES }, (_, i) => (
          <span key={i} className={`h-2.5 w-10 rounded-full ${i < friends ? 'bg-gold' : 'bg-line'}`} />
        ))}
      </div>
      <p className="text-navy-soft mt-2 text-base">
        {friends} of {FRIENDS_FOR_ALL_CATEGORIES} friends joined
      </p>
    </div>
  )
}

export default LockedCategoryPanel
