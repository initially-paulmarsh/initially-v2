// One gold badge with the four category icons filling it in a 2x2 grid --
// doubles as a legend for the app's four categories, not just a mark.
function Logo({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#c8922e" />

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
    </svg>
  )
}

export default Logo
