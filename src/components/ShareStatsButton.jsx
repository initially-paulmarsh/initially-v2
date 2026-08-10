import { useEffect, useRef, useState } from 'react'
import { buildStatsShareText } from '../lib/share'

function ShareStatsButton({ stats }) {
  const [copyState, setCopyState] = useState('idle') // idle | copied | failed
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(buildStatsShareText(stats))
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
      className="bg-gold w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
    >
      {copyState === 'copied' ? 'Copied! 📋' : copyState === 'failed' ? "Couldn't copy" : 'Share My Stats'}
    </button>
  )
}

export default ShareStatsButton
