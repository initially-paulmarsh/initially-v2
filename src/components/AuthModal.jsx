import { useState } from 'react'
import { signInWithEmail } from '../lib/auth'

function AuthModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || status === 'sending') return
    setStatus('sending')
    setError(null)
    const { error } = await signInWithEmail(email.trim())
    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
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
          <h2 className="text-navy text-xl font-bold">Save your streak</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-navy-soft hover:text-navy min-h-9 min-w-9 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {status === 'sent' ? (
          <p className="text-navy-soft mt-4 text-base leading-relaxed">
            Check <strong className="text-navy font-semibold">{email}</strong> for a magic link — tap it
            to sign in, no password needed.
          </p>
        ) : (
          <>
            <p className="text-navy-soft mt-2 text-base leading-relaxed">
              Sign in with just your email so your streak follows you across devices — no password
              required.
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
              {error && <p className="text-error text-sm">{error}</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-gold text-navy min-h-12 rounded-xl text-base font-semibold shadow-sm transition-all hover:enabled:shadow-md hover:enabled:brightness-105 disabled:opacity-40"
              >
                {status === 'sending' ? 'Sending…' : 'Send magic link'}
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
