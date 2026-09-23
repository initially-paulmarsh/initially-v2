import { useEffect, useState } from 'react'
import {
  fetchFriendsLeaderboard,
  fetchLeaderboard,
  fetchMyRank,
  inviteLink,
  reportDisplayName,
} from '../lib/profile'
import { buildInviteText } from '../lib/share'
import DisplayNameForm from './DisplayNameForm'
import ShareActions from './ShareActions'

// Weekly points (see weekly_points in add_invites_and_leaderboard.sql):
// 6 for a first-guess solve down to 1 for a sixth, best result per puzzle,
// resetting every Monday UK time so a newcomer can reach the top.
function LeaderboardPage({ session, profile, onProfileChanged, onSignIn, onClose }) {
  const [tab, setTab] = useState('friends') // friends | top
  const [rows, setRows] = useState(null)
  const [myRank, setMyRank] = useState(null)
  const [error, setError] = useState(null)
  const hasName = Boolean(profile?.display_name)

  useEffect(() => {
    if (!session || !hasName) return
    let cancelled = false
    setRows(null)
    setError(null)
    const request = tab === 'friends' ? fetchFriendsLeaderboard() : fetchLeaderboard()
    Promise.all([request, fetchMyRank()]).then(([board, rank]) => {
      if (cancelled) return
      if (board.error) setError(board.error.message)
      else setRows(board.data)
      setMyRank(rank.data)
    })
    return () => {
      cancelled = true
    }
  }, [tab, session, hasName])

  return (
    <div
      className="animate-fade-slide-in fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-card max-h-full w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-navy text-xl font-bold">Leaderboard</h2>
            <p className="text-navy-soft text-sm">This week · resets every Monday</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-navy-soft hover:text-navy min-h-9 min-w-9 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {!session ? (
          <div className="mt-6 text-center">
            <p className="text-navy-soft text-base leading-relaxed">
              Sign in to save your streak and see how you rank against friends and everyone else.
            </p>
            <button
              type="button"
              onClick={onSignIn}
              className="bg-gold text-navy mt-4 min-h-12 w-full rounded-xl text-base font-semibold shadow-sm transition-all hover:shadow-md hover:brightness-105"
            >
              Sign in
            </button>
          </div>
        ) : !hasName ? (
          <div className="mt-6">
            <p className="text-navy-soft text-base leading-relaxed">
              Pick the name other players will see next to your score.
            </p>
            <DisplayNameForm onSaved={onProfileChanged} />
          </div>
        ) : (
          <>
            <MyRankCard myRank={myRank} />

            <div className="bg-ivory mt-4 grid grid-cols-2 gap-1 rounded-xl p-1">
              {[
                ['friends', 'Friends'],
                ['top', 'Top 50'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`min-h-10 rounded-lg text-sm font-semibold transition-colors ${
                    tab === key ? 'bg-card text-navy shadow-sm' : 'text-navy-soft hover:text-navy'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {error && <p className="text-error mt-4 text-sm">{error}</p>}
            {!rows && !error && <p className="text-navy-soft mt-4 text-center text-sm">Loading…</p>}
            {rows && <BoardRows rows={rows} />}

            <div className="border-line mt-6 border-t pt-4">
              <p className="text-navy-soft mb-3 text-center text-sm leading-relaxed">
                {tab === 'friends' && rows?.length <= 1
                  ? 'No friends here yet — invite some to compete.'
                  : 'Invite more friends to compete.'}{' '}
                Each one who joins unlocks a category for you.
              </p>
              <ShareActions
                getText={() => buildInviteText(inviteLink(profile.invite_code))}
                whatsAppLabel="Invite on WhatsApp"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MyRankCard({ myRank }) {
  return (
    <div className="border-gold/40 bg-gold/8 mt-4 rounded-xl border px-4 py-3 text-center">
      {myRank ? (
        <>
          <p className="text-navy text-2xl font-extrabold">#{myRank.rank}</p>
          <p className="text-navy-soft text-sm">
            of {myRank.total_players} players · {myRank.points} points · {myRank.solved} solved
          </p>
        </>
      ) : (
        <p className="text-navy-soft text-sm">Solve a puzzle this week to get on the board.</p>
      )}
    </div>
  )
}

function BoardRows({ rows }) {
  if (rows.length === 0) {
    return (
      <p className="text-navy-soft mt-4 text-center text-sm">
        Nobody's scored yet this week — solve a puzzle to take #1.
      </p>
    )
  }

  return (
    <ol className="mt-4 space-y-1.5">
      {rows.map((row) => (
        <li
          key={row.user_id}
          className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 ${
            row.is_me ? 'bg-gold/12 border-gold/40 border' : 'bg-ivory'
          }`}
        >
          <span className="text-navy-soft w-9 shrink-0 text-sm font-bold">{row.rank ? `#${row.rank}` : '—'}</span>
          <span className="text-navy min-w-0 flex-1 truncate text-base font-semibold">
            {row.display_name}
            {row.is_me && <span className="text-navy-soft ml-1 text-sm font-normal">(you)</span>}
          </span>
          <span className="text-navy shrink-0 text-base font-bold">{row.points}</span>
          {row.is_me ? <span className="w-7 shrink-0" /> : <ReportButton userId={row.user_id} name={row.display_name} />}
        </li>
      ))}
    </ol>
  )
}

// Required by App Store guideline 1.2 for player-chosen names others can
// see. A second tap confirms, so a stray tap doesn't file a report. Three
// reports from different players hide the name until it's reviewed.
function ReportButton({ userId, name }) {
  const [state, setState] = useState('idle') // idle | confirm | sent

  async function handleClick() {
    if (state === 'idle') return setState('confirm')
    if (state === 'confirm') {
      await reportDisplayName(userId)
      setState('sent')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === 'sent'}
      aria-label={`Report the name ${name}`}
      className={`shrink-0 rounded-lg text-xs font-medium transition-colors ${
        state === 'idle' ? 'text-navy-soft/70 hover:text-error h-7 w-7' : 'text-error px-2 py-1'
      }`}
    >
      {state === 'idle' ? '⚑' : state === 'confirm' ? 'Report?' : 'Reported'}
    </button>
  )
}

export default LeaderboardPage
