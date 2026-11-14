import { LoaderCircle } from 'lucide-react'

/** Inline spinner with a label (the label is always announced to screen readers). */
export default function Loader({ label = 'Loading', className = '' }) {
  return (
    <span role="status" className={`inline-flex items-center gap-2 text-sm text-stone-deep ${className}`}>
      <LoaderCircle className="size-4 animate-spin text-ink" aria-hidden="true" />
      {label}
    </span>
  )
}

/** Full-area loader: three stations lighting up in sequence. */
export function PageLoader({ label = 'Loading' }) {
  return (
    <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span key={index} className="flex items-center gap-2">
            <span
              className="block size-3 animate-station rounded-full bg-ink"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
            {index < 2 && <span className="block h-0.5 w-6 bg-line-strong" />}
          </span>
        ))}
      </div>
      <p className="label-mono text-stone-deep">{label}</p>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-xs bg-paper-deep ${className}`} />
}
