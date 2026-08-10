// One gold badge: the four category icons fill the whole box in a 2x2
// grid, with a big translucent question mark layered on top -- the icons
// stay visible through it, the "?" reads as a watermark over them.
function Logo({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#9c6b0a" />

      <text x="17" y="17" fontSize="26" textAnchor="middle" dominantBaseline="central">
        🎬
      </text>
      <text x="47" y="17" fontSize="26" textAnchor="middle" dominantBaseline="central">
        📜
      </text>
      <text x="17" y="47" fontSize="26" textAnchor="middle" dominantBaseline="central">
        🎵
      </text>
      <text x="47" y="47" fontSize="26" textAnchor="middle" dominantBaseline="central">
        📖
      </text>

      <text
        x="32"
        y="33"
        fontSize="44"
        fontWeight="800"
        fill="#ffffff"
        fillOpacity="0.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui, sans-serif"
      >
        ?
      </text>
    </svg>
  )
}

export default Logo
