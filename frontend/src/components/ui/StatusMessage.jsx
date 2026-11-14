import { CircleAlert, Info, RotateCcw, TriangleAlert, CircleCheck } from 'lucide-react'
import { Button } from './Button'

/** Shown when a list has nothing to display. Always explain what to do next. */
export function EmptyState({ icon: Icon, title, description, action, compact = false, className = '' }) {
  return (
    <div
      className={`flex flex-col items-start gap-3 border border-dashed border-line-strong bg-surface/60 ${compact ? 'p-5' : 'p-8'} ${className}`}
    >
      {Icon && (
        <span className="flex size-10 items-center justify-center rounded-sm border border-line bg-paper">
          <Icon className="size-5 text-ink" aria-hidden="true" />
        </span>
      )}
      <div className="max-w-prose">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="mt-1 text-sm text-stone-deep">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/** Shown when a request fails. Offers a retry when one is possible. */
export function ErrorState({ error, title = 'This could not be loaded', onRetry, compact = false, className = '' }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-start gap-3 border border-vermilion/40 bg-vermilion-wash/60 ${compact ? 'p-5' : 'p-8'} ${className}`}
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-vermilion-deep" aria-hidden="true" />
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-charcoal">{error?.message ?? 'Please try again in a moment.'}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RotateCcw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

const NOTICE_TONES = {
  info: { icon: Info, classes: 'border-line-strong bg-surface', iconClass: 'text-ink' },
  warning: { icon: TriangleAlert, classes: 'border-vermilion/40 bg-vermilion-wash/50', iconClass: 'text-vermilion-deep' },
  success: { icon: CircleCheck, classes: 'border-chartreuse bg-chartreuse-wash', iconClass: 'text-ink' },
}

/** Inline editorial note, e.g. "Illustrative guidance — verify with official sources". */
export function Notice({ tone = 'info', title, icon, children, className = '' }) {
  const config = NOTICE_TONES[tone] ?? NOTICE_TONES.info
  const Icon = icon ?? config.icon
  return (
    <div className={`flex items-start gap-3 border-l-[3px] border-y border-r px-4 py-3 ${config.classes} ${className}`}>
      <Icon className={`mt-0.5 size-4 shrink-0 ${config.iconClass}`} aria-hidden="true" />
      <div className="text-sm leading-relaxed">
        {title && <p className="font-semibold text-ink">{title}</p>}
        <div className="text-charcoal">{children}</div>
      </div>
    </div>
  )
}
