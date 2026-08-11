import { useState } from 'react'
import { requestNotificationPermissionAndSchedule } from '../lib/notifications'

// A soft ask before the hard OS prompt: iOS only lets the real permission
// dialog appear once, and a denial there can only be undone in Settings — so
// we spend that one shot only on players who've already said yes here.
function NotificationOptIn({ onClose }) {
  const [status, setStatus] = useState('idle') // idle | asking | granted | denied

  async function handleYes() {
    setStatus('asking')
    const granted = await requestNotificationPermissionAndSchedule()
    setStatus(granted ? 'granted' : 'denied')
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
          <h2 className="text-navy text-xl font-bold">Never miss a puzzle</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-navy-soft hover:text-navy min-h-9 min-w-9 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {status === 'granted' ? (
          <p className="text-navy-soft mt-4 text-base leading-relaxed">
            You're all set — we'll nudge you at 9am when a new puzzle drops. 🔔
          </p>
        ) : status === 'denied' ? (
          <p className="text-navy-soft mt-4 text-base leading-relaxed">
            No problem — if you change your mind, you can turn reminders on later in your iPhone's
            Settings app.
          </p>
        ) : (
          <>
            <p className="text-navy-soft mt-2 text-base leading-relaxed">
              Get a quick daily nudge at 9am when a new puzzle is live — handy for keeping your
              streak going.
            </p>
            <button
              type="button"
              onClick={handleYes}
              disabled={status === 'asking'}
              className="bg-gold text-navy mt-4 min-h-12 w-full rounded-xl text-base font-semibold shadow-sm transition-all hover:enabled:shadow-md hover:enabled:brightness-105 disabled:opacity-40"
            >
              {status === 'asking' ? 'One sec…' : 'Yes, remind me 🔔'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-navy-soft hover:text-navy mt-3 min-h-9 w-full text-center text-sm font-medium transition-colors"
            >
              No thanks
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default NotificationOptIn
