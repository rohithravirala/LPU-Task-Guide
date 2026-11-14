import { BadgeCheck, CircleDashed } from 'lucide-react'

const TONES = {
  neutral: 'border-line bg-paper-deep text-stone-deep',
  outline: 'border-line-strong bg-transparent text-ink',
  ink: 'border-ink bg-ink text-paper',
  vermilion: 'border-vermilion/40 bg-vermilion-wash text-vermilion-deep',
  chartreuse: 'border-chartreuse bg-chartreuse-wash text-ink',
}

/** Small rectangular label (never a pill). */
export function Tag({ tone = 'neutral', icon: Icon, className = '', children, ...props }) {
  return (
    <span
      className={`label-mono inline-flex h-5 shrink-0 items-center gap-1 rounded-xs border px-1.5 ${TONES[tone] ?? TONES.neutral} ${className}`}
      {...props}
    >
      {Icon && <Icon className="size-3" aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Category wayfinding code, e.g. ATT. */
export function CategoryCode({ code, className = '' }) {
  if (!code) return null
  return (
    <span
      className={`num-mono inline-flex h-6 min-w-11 items-center justify-center rounded-xs border border-ink bg-surface px-1.5 text-[11px] font-semibold tracking-[0.08em] text-ink ${className}`}
    >
      {code}
    </span>
  )
}

/** Shows whether guidance or a service link has been checked against official sources. */
export function VerificationTag({ status, subject = 'guidance' }) {
  if (status === 'verified') {
    return (
      <Tag tone="chartreuse" icon={BadgeCheck} title={`This ${subject} has been verified against an official source`}>
        Verified
      </Tag>
    )
  }
  return (
    <Tag
      tone="outline"
      icon={CircleDashed}
      title={`This ${subject} is illustrative and has not been verified against official sources yet`}
    >
      Unverified
    </Tag>
  )
}
