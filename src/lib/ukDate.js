// Computes "today" as a calendar date in Europe/London, so every player
// worldwide queries the same daily_puzzles row regardless of local timezone.
export function getUkDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(date)
}
