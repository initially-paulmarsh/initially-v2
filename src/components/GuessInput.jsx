import { useEffect, useRef, useState } from 'react'

// lockedWords: array (length wordCount) of the correct word once that
// position has been solved, or null while still open. Solved positions
// render as static locked cells; only open positions are editable, and only
// those clear after each submit — the grid persists and improves in place
// rather than stacking a new row per attempt.
function GuessInput({ wordCount, lockedWords, onSubmit, disabled }) {
  const [values, setValues] = useState(() => Array(wordCount).fill(''))
  const [shaking, setShaking] = useState(false)
  const inputRefs = useRef([])
  const shakeTimeout = useRef(null)

  useEffect(() => {
    setValues(Array(wordCount).fill(''))
  }, [wordCount])

  useEffect(() => () => clearTimeout(shakeTimeout.current), [])

  function openIndices() {
    const indices = []
    for (let i = 0; i < wordCount; i++) {
      if (!lockedWords[i]) indices.push(i)
    }
    return indices
  }

  function focusInput(index) {
    inputRefs.current[index]?.focus()
  }

  function updateValue(index, value) {
    setValues((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function handleKeyDown(e, index) {
    const open = openIndices()
    const pos = open.indexOf(index)

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (pos < open.length - 1) {
        focusInput(open[pos + 1])
      } else {
        handleSubmit()
      }
    } else if (e.key === 'Backspace' && !values[index] && pos > 0) {
      e.preventDefault()
      focusInput(open[pos - 1])
    }
  }

  function handleSubmit(e) {
    e?.preventDefault()
    if (disabled) return
    const open = openIndices()
    if (open.some((i) => !values[i].trim())) return

    const guess = values.map((value, i) => (lockedWords[i] ? lockedWords[i] : value.trim()))
    const stillOpen = onSubmit(guess)

    setValues(Array(wordCount).fill(''))
    if (stillOpen) {
      setShaking(true)
      clearTimeout(shakeTimeout.current)
      shakeTimeout.current = setTimeout(() => setShaking(false), 400)
    }
    requestAnimationFrame(() => focusInput(openIndices()[0]))
  }

  const canSubmit = !disabled && openIndices().every((i) => values[i].trim())

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md flex-col items-center gap-4">
      {/* Fixed size, wraps to a second line if it doesn't fit -- wrapping
          is fine here (unlike the letter tiles), and a fixed size is a
          safer guarantee against overflow than forcing these to shrink. */}
      <div className={`flex flex-wrap justify-center gap-2 ${shaking ? 'animate-shake' : ''}`}>
        {Array.from({ length: wordCount }, (_, i) =>
          lockedWords[i] ? (
            <div
              key={i}
              className="animate-pop-in border-success/40 bg-success-bg text-success flex h-11 items-center justify-center rounded-lg border-2 px-2 text-sm font-semibold shadow-sm sm:h-14 sm:rounded-xl sm:px-4 sm:text-lg"
            >
              {lockedWords[i]}
            </div>
          ) : (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              value={values[i]}
              onChange={(e) => updateValue(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              disabled={disabled}
              placeholder={`Word ${i + 1}`}
              autoComplete="off"
              className="focus:border-gold text-navy border-line bg-card placeholder:text-navy-soft/60 h-11 w-16 rounded-lg border-2 px-1.5 text-center text-sm transition-colors focus:ring-2 focus:ring-gold/30 focus:outline-none disabled:opacity-50 sm:h-14 sm:w-28 sm:rounded-xl sm:px-2 sm:text-lg"
            />
          ),
        )}
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className="bg-gold text-navy min-h-11 rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition-all hover:enabled:shadow-md hover:enabled:brightness-105 disabled:opacity-40 sm:px-8 sm:py-3 sm:text-lg"
      >
        Guess
      </button>
    </form>
  )
}

export default GuessInput
