import { useId } from 'react'
import { Bookmark } from 'lucide-react'

export default function TabCard({ title, icon: Icon = Bookmark, count, action, children, className = '' }) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={`relative rounded-2xl border border-saffron/45 bg-surface pt-7 ${className}`}>
      <div className="absolute -top-4 right-4 left-4 flex items-center justify-between gap-3">
        <h2
          id={headingId}
          className="inline-flex items-center gap-2 rounded-xl bg-flame px-3.5 py-1.5 text-[15px] leading-tight font-semibold text-white shadow-sm shadow-flame/30"
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          {title}
          {count != null && <span className="rounded-md bg-white/20 px-1.5 text-xs font-semibold">{count}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
