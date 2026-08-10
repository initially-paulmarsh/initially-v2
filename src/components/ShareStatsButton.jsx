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
      className="bg-gold text-navy min-h-12 w-full rounded-xl px-4 py-3 text-base font-semibold shadow-sm transition-all hover:shadow-md hover:brightness-105"
    >
      {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? "Couldn't copy" : 'Share My Stats'}
    </button>
  )
}

export default ShareStatsButton
