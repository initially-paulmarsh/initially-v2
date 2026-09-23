import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isNativePlatform } from '../lib/notifications'

// Writes to the insert-only feedback table (add_feedback.sql). The email is
// optional and only for a reply -- prefilled for signed-in players, since
// that's almost always where they'd want an answer.
function FeedbackModal({ session, onClose }) {
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(session?.user?.email ?? '')
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim() || status === 'sending') return
    setStatus('sending')
    setError(null)
    // No .select() -- the table is insert-only, so asking for the row back
    // would fail the RLS check.
    const { error } = await supabase.from('feedback').insert({
      message: message.trim(),
      contact_email: email.trim() || null,
      platform: isNativePlatform() ? 'ios' : 'web',
    })
    if (error) {
      setError("Sorry, that didn't send. Please try again.")
      setStatus('idle')
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
          <h2 className="text-navy text-xl font-bold">Feedback</h2>
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
          <>
            <p className="text-navy mt-4 text-base leading-relaxed">
              Thank you! We read every message.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-gold text-navy mt-5 min-h-12 w-full rounded-xl text-base font-semibold shadow-sm transition-all hover:shadow-md hover:brightness-105"
            >
              Close
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3">
            <p className="text-navy-soft text-base leading-relaxed">
              Found a mistake, have an idea, or just want to say hello? We'd love to hear it.
            </p>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="Your message"
              autoFocus
              className="text-navy border-line bg-ivory placeholder:text-navy-soft/60 focus:border-gold w-full resize-none rounded-xl border-2 px-3 py-2.5 text-base leading-relaxed transition-colors focus:ring-2 focus:ring-gold/30 focus:outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email, if you'd like a reply (optional)"
              autoComplete="email"
              className="text-navy border-line bg-ivory placeholder:text-navy-soft/60 focus:border-gold h-12 w-full rounded-xl border-2 px-3 text-base transition-colors focus:ring-2 focus:ring-gold/30 focus:outline-none"
            />
            {error && <p className="text-error text-base">{error}</p>}
            <button
              type="submit"
              disabled={status === 'sending' || !message.trim()}
              className="bg-gold text-navy min-h-12 rounded-xl text-base font-semibold shadow-sm transition-all hover:enabled:shadow-md hover:enabled:brightness-105 disabled:opacity-40"
            >
              {status === 'sending' ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default FeedbackModal
