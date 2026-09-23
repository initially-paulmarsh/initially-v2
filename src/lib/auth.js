import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// Where Supabase redirects back to after the player taps the magic link in
// their email. Must be added to Authentication > URL Configuration >
// Redirect URLs in the Supabase dashboard for every origin this runs on
// (localhost during dev, the deployed Netlify URL/domain in prod) — Supabase
// rejects the callback otherwise.
const REDIRECT_URL = window.location.origin

// shouldCreateUser defaults to true, so the first code for a new email both
// creates the auth.users row and signs them in — no separate sign-up step,
// consistent with "every user is a Supabase Auth user."
//
// The email carries both a one-time code ({{ .Token }}) and the magic link
// — see the Magic Link template in Supabase > Authentication > Emails. The
// code is what the app asks for, because inside the iOS shell the link
// opens Safari and signs in the website, not the app. The link still works
// for anyone on the web who taps it instead.
export function signInWithEmail(email) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: REDIRECT_URL },
  })
}

// App Review can't receive our emailed codes, so this one account (created
// in Supabase with a password, see the App Store submission notes) signs
// in with a password instead. Typing this exact address is the only way to
// see the password field -- everyone else gets the code flow.
export const REVIEW_EMAIL = 'review@initially-app.com'

export function isReviewEmail(email) {
  return email.trim().toLowerCase() === REVIEW_EMAIL
}

export function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password })
}

// Resolves the session via onAuthStateChange, same as the magic link does.
export function verifyEmailCode(email, token) {
  return supabase.auth.verifyOtp({ email, token, type: 'email' })
}

export function signOut() {
  return supabase.auth.signOut()
}

// Required by App Store guideline 5.1.1(v) for any app that lets players
// create an account. The delete_own_account RPC (supabase/schema.sql)
// removes the player's plays, stats and auth.users row server-side; the
// local sign-out afterwards just clears the now-orphaned session.
export async function deleteAccount() {
  const { error } = await supabase.rpc('delete_own_account')
  if (error) return { error }
  await supabase.auth.signOut({ scope: 'local' })
  return { error: null }
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
