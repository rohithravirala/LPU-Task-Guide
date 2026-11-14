import { Link } from 'react-router-dom'

/** Route glyph: a start station, a turn, and the destination marked in vermilion. */
export function RouteGlyph({ className = 'size-7', inverted = false }) {
  const stroke = inverted ? '#F4F0E7' : '#173B35'
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="4" fill={inverted ? '#0F2925' : '#173B35'} />
      <path d="M9 8v8a6 6 0 0 0 6 6h8" stroke={inverted ? stroke : '#F4F0E7'} strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="9" cy="8" r="3" fill="#F4F0E7" />
      <circle cx="23" cy="22" r="3.5" fill="#D65A3A" />
    </svg>
  )
}

export function Wordmark({ to = '/', inverted = false, className = '' }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 rounded-sm ${className}`}
      aria-label="LPU-Uni-Path home"
    >
      <RouteGlyph inverted={inverted} />
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className={`num-mono text-[11px] font-semibold tracking-[0.12em] ${inverted ? 'text-ink-mist' : 'text-stone-deep'}`}>
          LPU
        </span>
        <span className={`font-display text-[17px] font-semibold tracking-tight ${inverted ? 'text-paper' : 'text-ink'}`}>
          Uni-Path
        </span>
      </span>
    </Link>
  )
}
