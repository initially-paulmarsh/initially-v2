import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// Every call below is a security definer RPC in add_invites_and_leaderboard.sql
// -- profiles can't be written directly from the client, so a player can't
// grant themselves unlocks from the browser console.

export const SITE_URL = 'https://www.initially-app.com'

const PENDING_INVITE_KEY = 'initially_pending_invite'

// Tracks the signed-in player's profile: display name, invite code, how many
// friends have joined through it, and which categories they've unlocked.
// `null` when signed out or not yet loaded; `refresh` re-fetches after
// anything that changes it (claiming an invite, unlocking, renaming).
export function useProfile(session) {
  const [profile, setProfile] = useState(null)
  const userId = session?.user?.id

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase.rpc('get_my_profile')
    if (error) {
      console.error('get_my_profile failed', error)
      return
    }
    setProfile(data?.[0] ?? null)
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  // A friend joining happens on someone else's device, so pick it up
  // whenever the player comes back to the app or tab.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  return { profile, refresh }
}

export function inviteLink(inviteCode) {
  return inviteCode ? `${SITE_URL}/?invite=${inviteCode}` : SITE_URL
}

// Picks up ?invite=CODE from a shared link on first load, holds onto it
// until the visitor signs in (which may be several puzzles later), and
// strips it from the address bar so a reload or re-share doesn't carry it.
export function captureInviteFromUrl() {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('invite')
  if (!code) return
  try {
    localStorage.setItem(PENDING_INVITE_KEY, code.trim().toUpperCase())
  } catch {
    // Private mode etc. -- the invite just won't be credited.
  }
  url.searchParams.delete('invite')
  window.history.replaceState(null, '', url.pathname + url.search + url.hash)
}

export function getPendingInvite() {
  try {
    return localStorage.getItem(PENDING_INVITE_KEY)
  } catch {
    return null
  }
}

export function setPendingInvite(code) {
  try {
    if (code) localStorage.setItem(PENDING_INVITE_KEY, code.trim().toUpperCase())
    else localStorage.removeItem(PENDING_INVITE_KEY)
  } catch {
    // ignore
  }
}

// Credits a waiting invite to whoever sent it. The server only counts it
// for a brand-new account, so it's safe to try on every sign-in; either way
// the pending code is spent. Resolves to the inviter's name ('' if they
// haven't picked one) when it counted, null otherwise.
export async function claimPendingInvite() {
  const code = getPendingInvite()
  if (!code) return null
  setPendingInvite(null)
  const { data, error } = await supabase.rpc('claim_invite', { code })
  if (error) {
    console.error('claim_invite failed', error)
    return null
  }
  return data
}

export function unlockCategory(category) {
  return supabase.rpc('unlock_category', { category })
}

export function setDisplayName(name) {
  return supabase.rpc('set_display_name', { new_name: name })
}

export function fetchLeaderboard() {
  return supabase.rpc('get_leaderboard', { max_rows: 50 })
}

export function fetchFriendsLeaderboard() {
  return supabase.rpc('get_friends_leaderboard')
}

export async function fetchMyRank() {
  const { data, error } = await supabase.rpc('get_my_rank')
  return { data: data?.[0] ?? null, error }
}

export function reportDisplayName(userId) {
  return supabase.rpc('report_display_name', { target: userId })
}
