import { useEffect, useRef, useState } from 'react'
import { buildResultShareText } from '../lib/share'
import { getUkDateString } from '../lib/ukDate'

function ShareButton({ puzzle, game }) {
  const [copyState, setCopyState] = useState('idle') // idle | copied | failed
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  async function handleClick() {
    const text = buildResultShareText({
      category: puzzle.category,
      status: game.status,
      guessHistory: game.guessHistory,
      puzzleDate: getUkDateString(),
    })

    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopyState('idle'), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-gold text-navy mt-5 min-h-12 w-full max-w-xs rounded-xl px-6 py-3 text-lg font-semibold shadow-sm transition-all hover:shadow-md hover:brightness-105"
    >
      {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? "Couldn't copy" : 'Share Result'}
    </button>
  )
}

export default ShareButton
