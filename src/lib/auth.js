import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// Where Supabase redirects back to after the player taps the magic link in
// their email. Must be added to Authentication > URL Configuration >
// Redirect URLs in the Supabase dashboard for every origin this runs on
// (localhost during dev, the deployed Netlify URL/domain in prod) — Supabase
// rejects the callback otherwise.
const REDIRECT_URL = window.location.origin

// shouldCreateUser defaults to true, so the first magic link for a new
// email both creates the auth.users row and signs them in — no separate
// sign-up step, consistent with "every user is a Supabase Auth user."
export function signInWithEmail(email) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: REDIRECT_URL },
  })
}

export function signOut() {
  return supabase.auth.signOut()
}

// Tracks the current session client-side. `undefined` means "not yet
// resolved" (initial load), `null` means "resolved, signed out" — callers
// that care about the signed-out state specifically should check for
// `null`, not falsiness, to avoid acting before the initial check completes.
//
// Session persistence across visits and magic-link redirect handling both
// come from supabase-js's own defaults (persistSession, detectSessionInUrl)
// — onAuthStateChange fires for both, so one subscription covers it all.
export function useSession() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return session
}
