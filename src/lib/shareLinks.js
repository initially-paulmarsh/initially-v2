// WhatsApp's own share URL: opens the app (or WhatsApp Web on desktop) with
// the message typed in and the contact picker up. Inside the iOS shell,
// Capacitor hands non-app URLs to the system, which routes wa.me straight
// into WhatsApp when it's installed.
export function openWhatsAppShare(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

// Resolves true on success. Pasting into Messenger, Instagram, SMS etc. is
// the player's call from there.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
