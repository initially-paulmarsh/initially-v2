// The word under the card logo (LogoMark): plain upright capitals in the
// brand gold, widely spaced -- simple and easy to read for this audience,
// and low enough to leave room for the logo above. Live text, so it stays
// crisp at any size.
function Wordmark() {
  return (
    <h1 className="w-full text-center" aria-label="Initially — guess the title from its initials">
      <span
        aria-hidden="true"
        // The left padding balances the trailing letter-spacing after the
        // last letter, so the word sits visually centred.
        className="wordmark-letter inline-block pl-[0.16em] font-['Playfair_Display',Georgia,serif] text-[clamp(2.2rem,11.5vw,3.4rem)] leading-[1.1] font-bold tracking-[0.16em]"
      >
        INITIALLY
      </span>
      <span
        aria-hidden="true"
        className="text-navy-soft mt-1 block text-center text-[clamp(0.75rem,3.2vw,1rem)] font-extrabold tracking-[0.14em] whitespace-nowrap"
      >
        GUESS THE TITLE FROM ITS INITIALS
      </span>
    </h1>
  )
}

export default Wordmark
