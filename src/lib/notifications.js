import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const REMINDER_ID = 1001
const PROMPT_KEY = 'initially_notif_prompted'

// A handful of variants in the app's existing playful voice (see
// lib/messages.js) — picked by calendar day so the same line doesn't show up
// every single morning, without needing a server to drive it.
const REMINDER_MESSAGES = [
  "🧩 Today's puzzle is live — go guess it!",
  '🔥 Keep the streak alive — a fresh puzzle is waiting.',
  "🕵️ New initials to crack. Today's puzzle is up!",
  '⏰ Your daily brain teaser has landed. Go get it!',
  '🎯 Fresh puzzle, fresh shot at glory. Live now.',
]

function pickTodaysMessage() {
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  return REMINDER_MESSAGES[dayIndex % REMINDER_MESSAGES.length]
}

export function isNativePlatform() {
  return Capacitor.isNativePlatform()
}

export function hasBeenPromptedForNotifications() {
  return Boolean(localStorage.getItem(PROMPT_KEY))
}

export function markNotificationsPrompted() {
  localStorage.setItem(PROMPT_KEY, '1')
}

// Replaces (rather than adds to) any existing pending reminder, both so
// re-running this never piles up duplicate notifications and so the body
// text can rotate day to day — repeats:true reuses one fixed request
// otherwise, which would freeze the copy at whatever it was when first
// scheduled.
export async function scheduleDailyReminder() {
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: 'Initially',
        body: pickTodaysMessage(),
        schedule: { on: { hour: 9, minute: 0 }, repeats: true },
      },
    ],
  })
}

// Fires the native OS permission dialog. Only call this from a deliberate
// user action (e.g. tapping "Yes, remind me") — iOS only lets you show this
// prompt once; a denial can only be reversed by the user in Settings, so it
// should never fire automatically on launch or unprompted.
export async function requestNotificationPermissionAndSchedule() {
  const { display } = await LocalNotifications.checkPermissions()
  let granted = display === 'granted'
  if (display === 'prompt' || display === 'prompt-with-rationale') {
    const result = await LocalNotifications.requestPermissions()
    granted = result.display === 'granted'
  }
  if (granted) await scheduleDailyReminder()
  return granted
}

// Safe to call on every app launch: never prompts, just re-rotates today's
// copy for a returning user who already granted permission earlier.
export async function rescheduleIfAlreadyGranted() {
  const { display } = await LocalNotifications.checkPermissions()
  if (display === 'granted') await scheduleDailyReminder()
}
