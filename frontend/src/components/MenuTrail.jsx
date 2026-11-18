import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'

export default function MenuTrail({ portal, path = [], large = false }) {
  const parts = [portal?.name, ...path].filter(Boolean)
  if (parts.length < 2) return null

  return (
    <p className={`flex flex-wrap items-center ${large ? 'gap-2' : 'mt-1.5 gap-x-1 gap-y-0.5 text-[13px] text-muted'}`}>
      {parts.map((part, index) => {
        const isPortal = index === 0
        const isLast = index === parts.length - 1
        const chipClass = isPortal
          ? 'bg-flame text-white'
          : isLast
            ? 'border border-flame/40 bg-flame-wash font-semibold text-flame-deep'
            : 'border border-line-strong bg-surface text-charcoal'

        return (
          <Fragment key={`${part}-${index}`}>
            {index > 0 && (
              <>
                <ChevronRight className={`${large ? 'size-4' : 'size-3.5'} shrink-0 text-muted/70`} aria-hidden="true" />
                <span className="sr-only">, then </span>
              </>
            )}
            {large ? (
              <span className={`rounded-lg px-3 py-1.5 text-sm font-medium ${chipClass}`}>{part}</span>
            ) : (
              <span className={isPortal ? 'font-semibold text-flame-deep' : isLast ? 'font-medium text-charcoal' : ''}>{part}</span>
            )}
          </Fragment>
        )
      })}
    </p>
  )
}
