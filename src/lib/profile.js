import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// Every call below is a security definer RPC in add_invites_and_leaderboard.sql
// -- profiles can't be written directly from the client, so a player can't
// grant themselves unlocks from the browser console.

export const SITE_URL = 'https://www.initially-app.com'

const PENDING_INVITE_KEY = 'initially_pending_invite'
const PROFILE_REFRESH_MS = 30_000
let pendingInvite

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
    if (!userId) return
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    const interval = window.setInterval(onVisible, PROFILE_REFRESH_MS)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      window.clearInterval(interval)
    }
  }, [refresh, userId])

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
  setPendingInvite(code)
  url.searchParams.delete('invite')
  window.history.replaceState(null, '', url.pathname + url.search + url.hash)
}

export function getPendingInvite() {
  if (pendingInvite !== undefined) return pendingInvite
  try {
    return localStorage.getItem(PENDING_INVITE_KEY)
  } catch {
    return null
  }
}

export function setPendingInvite(code) {
  pendingInvite = code?.trim().toUpperCase() || null
  try {
    if (pendingInvite) localStorage.setItem(PENDING_INVITE_KEY, pendingInvite)
    else localStorage.removeItem(PENDING_INVITE_KEY)
  } catch {
    // ignore
  }
}

// Signup metadata survives opening the email on another browser or device.
// The RPC checks account age and prevents duplicate or self-referrals.
export async function claimPendingInvite(user) {
  const localCode = getPendingInvite()
  const metadataCode = user.user_metadata?.initially_invite_code
  const code = typeof metadataCode === 'string' ? metadataCode : localCode
  if (!code) return
  try {
    const { error } = await supabase.rpc('claim_invite', { code })
    if (error) throw error
    if (getPendingInvite() === localCode) setPendingInvite(null)
  } catch (error) {
    console.error('claim_invite failed', error)
  }
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
