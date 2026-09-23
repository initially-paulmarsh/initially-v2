import { useState } from 'react'
import { setDisplayName } from '../lib/profile'

// Validation (length, characters, word filter, uniqueness) all happens in
// set_display_name on the server; its error messages are written to be
// shown to the player as-is.
function DisplayNameForm({ initialName = '', onSaved, submitLabel = 'Save name' }) {
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)
    const { error } = await setDisplayName(name)
    setSaving(false)
    if (error) setError(error.message)
    else onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
      <input
        type="text"
        required
        minLength={3}
        maxLength={20}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Paul M"
        autoComplete="nickname"
        className="text-navy border-line bg-ivory placeholder:text-navy-soft/60 focus:border-gold h-12 w-full rounded-xl border-2 px-3 text-base transition-colors focus:ring-2 focus:ring-gold/30 focus:outline-none"
      />
      {error && <p className="text-error text-base">{error}</p>}
      <button
        type="submit"
        disabled={saving || name.trim().length < 3}
        className="bg-gold text-navy min-h-12 rounded-xl text-base font-semibold shadow-sm transition-all hover:enabled:shadow-md hover:enabled:brightness-105 disabled:opacity-40"
      >
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

export default DisplayNameForm
