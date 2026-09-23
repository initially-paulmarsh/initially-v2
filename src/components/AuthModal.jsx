import { useState } from 'react'
import { signInWithEmail, verifyEmailCode } from '../lib/auth'
import { getPendingInvite, setPendingInvite } from '../lib/profile'

function AuthModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  // Prefilled from a ?invite= link (lib/profile.js). Typing one in covers a
  // friend who got the code some other way, e.g. installed the app straight
  // from the App Store rather than tapping the link.
  const [inviteCode, setInviteCode] = useState(() => getPendingInvite() ?? '')
  const [showInvite, setShowInvite] = useState(() => Boolean(getPendingInvite()))
  const [status, setStatus] = useState('idle') // idle | sending | sent | verifying | error
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || status === 'sending') return
    setStatus('sending')
    setError(null)
    // Held until the session appears, then claimed by App -- see
    // claimPendingInvite.
    setPendingInvite(inviteCode.trim() || null)
    const { error } = await signInWithEmail(email.trim())
    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  // On success the session arrives through onAuthStateChange, and App
  // closes this modal once it sees it — nothing to do here but wait.
  async function handleVerify(e) {
    e.preventDefault()
    if (!code || status === 'verifying') return
    setStatus('verifying')
    setError(null)
    const { error } = await verifyEmailCode(email.trim(), code)
    if (error) {
      setError(error.message)
      setStatus('sent')
    }
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
          <h2 className="text-navy text-xl font-bold">Sign in</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-navy-soft hover:text-navy min-h-9 min-w-9 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {status === 'sent' || status === 'verifying' ? (
          <>
            <p className="text-navy-soft mt-2 text-base leading-relaxed">
              We emailed a code to <strong className="text-navy font-semibold">{email}</strong> —
              enter it below to sign in.
            </p>
            <form onSubmit={handleVerify} className="mt-4 flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="123456"
                autoComplete="one-time-code"
                autoFocus
                className="text-navy border-line bg-ivory placeholder:text-navy-soft/60 focus:border-gold h-12 w-full rounded-xl border-2 px-3 text-center text-xl tracking-[0.3em] transition-colors focus:ring-2 focus:ring-gold/30 focus:outline-none"
              />
              {error && <p className="text-error text-sm">{error}</p>}
              <button
                type="submit"
                disabled={status === 'verifying' || code.length < 6}
                className="bg-gold text-navy min-h-12 rounded-xl text-base font-semibold shadow-sm transition-all hover:enabled:shadow-md hover:enabled:brightness-105 disabled:opacity-40"
              >
                {status === 'verifying' ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setCode('')
                setError(null)
                setStatus('idle')
              }}
              className="text-navy-soft hover:text-navy mt-3 min-h-9 w-full text-center text-sm font-medium transition-colors"
            >
              Use a different email
            </button>
          </>
        ) : (
          <>
            <p className="text-navy-soft mt-2 text-base leading-relaxed">
              Save your streak and see how you rank against friends and everyone else. Just your
              email — no password.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className="text-navy border-line bg-ivory placeholder:text-navy-soft/60 focus:border-gold h-12 w-full rounded-xl border-2 px-3 text-base transition-colors focus:ring-2 focus:ring-gold/30 focus:outline-none"
              />
              {showInvite ? (
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Invite code (optional)"
                  autoCapitalize="characters"
                  autoComplete="off"
                  maxLength={12}
                  className="text-navy border-line bg-ivory placeholder:text-navy-soft/60 focus:border-gold h-12 w-full rounded-xl border-2 px-3 text-base tracking-widest transition-colors focus:ring-2 focus:ring-gold/30 focus:outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowInvite(true)}
                  className="text-navy-soft hover:text-navy self-start text-sm font-medium underline decoration-dotted underline-offset-4"
                >
                  Have an invite code?
                </button>
              )}
              {error && <p className="text-error text-sm">{error}</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-gold text-navy min-h-12 rounded-xl text-base font-semibold shadow-sm transition-all hover:enabled:shadow-md hover:enabled:brightness-105 disabled:opacity-40"
              >
                {status === 'sending' ? 'Sending…' : 'Email me a code'}
              </button>
            </form>
            <button
              type="button"
              onClick={onClose}
              className="text-navy-soft hover:text-navy mt-3 min-h-9 w-full text-center text-sm font-medium transition-colors"
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthModal
