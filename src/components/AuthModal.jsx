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
      className="animate-fade-slide-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Save your streak</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        {status === 'sent' ? (
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            Check <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{email}</strong>{' '}
            for a magic link — tap it to sign in, no password needed.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
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
                className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:ring-white/10"
              />
              {error && <p className="text-sm text-rose-500">{error}</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="h-11 rounded-lg bg-neutral-900 text-sm font-semibold text-white shadow-sm transition-all hover:enabled:shadow-md disabled:opacity-40 dark:bg-white dark:text-neutral-900"
              >
                {status === 'sending' ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full text-center text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
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
