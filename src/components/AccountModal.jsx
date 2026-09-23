import { useState } from 'react'
import { deleteAccount, signOut } from '../lib/auth'
import DisplayNameForm from './DisplayNameForm'

// Opened from the signed-in header link. Delete asks for a second tap in
// place (rather than window.confirm) so it reads the same in the iOS shell
// as on the web.
function AccountModal({ email, profile, onProfileChanged, onClose }) {
  const [editingName, setEditingName] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSignOut() {
    await signOut()
    onClose()
  }

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    const { error } = await deleteAccount()
    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }
    onClose()
  }

  return (
    <div
      className="animate-fade-slide-in fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-navy text-xl font-bold">Account</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-navy-soft hover:text-navy min-h-9 min-w-9 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="text-navy-soft mt-2 text-base leading-relaxed">
          Signed in as <strong className="text-navy font-semibold">{email}</strong>
        </p>

        <div className="border-line mt-4 rounded-xl border p-4">
          <p className="text-navy-soft text-xs font-semibold tracking-wide uppercase">Leaderboard name</p>
          {editingName ? (
            <DisplayNameForm
              initialName={profile?.display_name ?? ''}
              onSaved={() => {
                setEditingName(false)
                onProfileChanged()
              }}
            />
          ) : (
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-navy text-base font-semibold">{profile?.display_name ?? 'Not set yet'}</span>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="text-navy-soft hover:text-navy min-h-9 text-sm font-medium underline decoration-dotted underline-offset-4"
              >
                {profile?.display_name ? 'Change' : 'Choose'}
              </button>
            </div>
          )}
          {profile?.invite_code && (
            <p className="text-navy-soft mt-3 text-sm">
              Your invite code: <strong className="text-navy tracking-widest">{profile.invite_code}</strong>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="bg-gold text-navy mt-4 min-h-12 w-full rounded-xl text-base font-semibold shadow-sm transition-all hover:shadow-md hover:brightness-105"
        >
          Sign out
        </button>

        {confirming ? (
          <div className="border-line mt-4 rounded-xl border-2 p-4">
            <p className="text-navy text-sm leading-relaxed">
              This permanently deletes your account, streaks and stats. It can't be undone.
            </p>
            {error && <p className="text-error mt-2 text-sm">{error}</p>}
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="text-navy-soft hover:text-navy min-h-10 flex-1 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-error min-h-10 flex-1 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              >
                {deleting ? 'Deleting…' : 'Delete forever'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-error mt-3 min-h-9 w-full text-center text-sm font-medium"
          >
            Delete account
          </button>
        )}
      </div>
    </div>
  )
}

export default AccountModal
