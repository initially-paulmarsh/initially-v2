import { buildResultShareText } from '../lib/share'
import { inviteLink } from '../lib/profile'
import { getUkDateString } from '../lib/ukDate'
import ShareActions from './ShareActions'

// Signed-out players can still share (every share brings in new players),
// but only a signed-in player's link carries an invite code -- so the nudge
// underneath tells them what they're missing.
function ShareButton({ puzzle, game, profile, signedIn, onSignIn }) {
  function getText() {
    return buildResultShareText({
      category: puzzle.category,
      status: game.status,
      guessHistory: game.guessHistory,
      puzzleDate: getUkDateString(),
      link: inviteLink(profile?.invite_code),
    })
  }

  return (
    <div className="mt-5 w-full">
      <ShareActions getText={getText} whatsAppLabel="Share result on WhatsApp" />
      {signedIn ? (
        <p className="text-navy-soft mt-2 text-xs leading-relaxed">
          Every friend who joins through your link unlocks a category for you — forever.
        </p>
      ) : (
        <p className="text-navy-soft mt-2 text-xs leading-relaxed">
          <button
            type="button"
            onClick={onSignIn}
            className="text-navy font-semibold underline decoration-dotted underline-offset-2"
          >
            Sign in first
          </button>{' '}
          so friends who join through your link unlock categories for you.
        </p>
      )}
    </div>
  )
}

export default ShareButton
