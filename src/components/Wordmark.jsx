// Live-text header lockup, replacing the old logo-wordmark.webp so the word
// stays crisp at any size and matches the app icon: every letter, the
// leading I included, gets the icon's own top-to-bottom gold gradient
// (sampled from public/icon-512.png) rather than the I sitting on a
// separate navy tile. Each letter has an equal-width cell with its own
// tick beneath, echoing the game's letter blanks.
const LETTERS = 'INITIALLY'.split('')

function Wordmark() {
  return (
    <h1 className="w-full" aria-label="INITIALLY — guess the title from its initials">
      <span aria-hidden="true" className="grid w-full grid-cols-9 gap-x-[1.2%]">
        {LETTERS.map((letter, i) => (
          <span key={i} className="flex flex-col items-center">
            <span className="wordmark-letter font-['Playfair_Display',Georgia,serif] text-[clamp(2.1rem,12vw,3.5rem)] leading-none font-bold">
              {letter}
            </span>
            <span className="mt-2 h-[3px] w-full rounded-full bg-gradient-to-r from-[#e3cb94] via-[#c8922e] to-[#e3cb94]" />
          </span>
        ))}
      </span>
      <span
        aria-hidden="true"
        className="text-navy-soft mt-3 block text-center text-[clamp(0.65rem,3.1vw,1rem)] font-extrabold tracking-[0.16em] whitespace-nowrap"
      >
        GUESS THE TITLE FROM ITS INITIALS
      </span>
    </h1>
  )
}

export default Wordmark
