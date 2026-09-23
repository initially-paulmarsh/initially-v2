// The brand mark: a gold card showing an initial "I" laid over a burgundy
// card with a "?" -- the game in one picture (you're shown the initial, you guess
// the rest). Same drawing as the app icon (rendered to
// ios/App/App/Assets.xcassets/AppIcon.appiconset and public/icon-*.png), kept
// as inline SVG here so it's crisp at any size. The glyphs use Playfair
// Display 900, loaded in index.css.
function LogoMark({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Initially logo">
      <defs>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#e2bc6c" />
          <stop offset="1" stopColor="#b8862e" />
        </linearGradient>
        {/* Burgundy rather than the UI navy: a warmer partner for the gold,
            and a deeper cousin of the terracotta accent. */}
        <linearGradient id="logo-wine" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#8e3d48" />
          <stop offset="1" stopColor="#5a2029" />
        </linearGradient>
        <filter id="logo-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.2" stdDeviation="2.2" floodColor="#3b2a10" floodOpacity="0.28" />
        </filter>
      </defs>
      <g transform="rotate(10 61 47)" filter="url(#logo-shadow)">
        <rect x="40" y="19" width="42" height="56" rx="7" fill="url(#logo-wine)" />
        <rect
          x="40.8"
          y="19.8"
          width="40.4"
          height="54.4"
          rx="6.3"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.16"
          strokeWidth="0.9"
        />
        <text
          x="67"
          y="58.5"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="900"
          fontSize="32"
          fill="#f3e6c8"
        >
          ?
        </text>
      </g>
      <g transform="rotate(-8 37 54)" filter="url(#logo-shadow)">
        <rect x="16" y="26" width="42" height="56" rx="7" fill="url(#logo-gold)" />
        <rect
          x="16.8"
          y="26.8"
          width="40.4"
          height="54.4"
          rx="6.3"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="0.9"
        />
        <text
          x="37"
          y="67"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="900"
          fontSize="34"
          fill="#2b2113"
        >
          I
        </text>
      </g>
    </svg>
  )
}

export default LogoMark
