import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowUpRight, Bell } from 'lucide-react'
import PortalMark from '../../components/PortalMark'
import TabCard from '../../components/TabCard'
import { getErrorMessage, getUpdates } from '../../services/api'

const kindStyles = {
  deadline: { label: 'Deadline', className: 'bg-flame-wash text-flame-deep' },
  alert: { label: 'Alert', className: 'bg-danger-wash text-danger' },
  update: { label: 'Update', className: 'bg-blue-wash text-blue-deep' },
}

function dueText(update) {
  if (update.dueInDays == null) return ''
  const when = update.dueInDays === 0 ? 'today' : update.dueInDays === 1 ? 'tomorrow' : `in ${update.dueInDays} days`
  return `Due ${when} · ${format(new Date(update.dueDate), 'EEE, d MMM')}`
}

export default function YourUpdates() {
  const [updates, setUpdates] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getUpdates()
      .then((data) => setUpdates(data.updates))
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  return (
    <TabCard
      title="Your updates"
      icon={Bell}
      count={updates?.length}
      action={
        <span className="rounded-full border border-saffron/60 bg-surface px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-flame-deep">
          SAMPLE
        </span>
      }
    >
      {!updates && !error && <p className="px-4 pb-4 text-sm text-muted">Loading…</p>}
      {error && <p role="alert" className="px-4 pb-4 text-sm text-danger">{error}</p>}

      {updates && (
        <ul className="scroll-area grid max-h-[360px] gap-3 overflow-y-auto overscroll-contain px-4 pb-4 sm:grid-cols-2 xl:grid-cols-3">
          {updates.map((update) => {
            const kind = kindStyles[update.kind] ?? kindStyles.update
            const { task } = update
            return (
              <li key={update._id} className="flex items-start gap-3 rounded-xl border border-line bg-paper/50 p-3.5">
                <PortalMark portal={task.portal} size="sm" />
                <div className="min-w-0 flex-1">
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${kind.className}`}>{kind.label}</span>
                  <p className="mt-1 leading-snug font-semibold text-ink">{update.title}</p>
                  <p className="mt-0.5 text-sm leading-snug text-muted">{update.detail}</p>
                  {update.dueDate && <p className="mt-1 text-[13px] font-medium text-flame-deep">{dueText(update)}</p>}
                  <p className="mt-2 flex items-center gap-4 text-sm font-semibold">
                    <Link to={`/tasks/${task._id}`} className="text-blue hover:underline">
                      Steps<span className="sr-only"> for {task.title}</span>
                    </Link>
                    {task.openUrl && (
                      <a
                        href={task.openUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-flame-deep hover:underline"
                      >
                        Open {task.portal?.name}
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">(new tab)</span>
                      </a>
                    )}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="rounded-b-2xl border-t border-line bg-paper/60 px-4 py-3 text-xs leading-snug text-muted">
        * Sample updates. With an official LPU API, your real deadlines and messages would appear here.
      </p>
    </TabCard>
  )
}
