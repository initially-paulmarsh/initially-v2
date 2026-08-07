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
      className="mt-4 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
    >
      {copyState === 'copied' ? 'Copied! 📋' : copyState === 'failed' ? "Couldn't copy" : 'Share Result'}
    </button>
  )
}

export default ShareButton
