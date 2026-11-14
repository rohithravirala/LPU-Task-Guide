import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowUpRight, Bell, ListOrdered } from 'lucide-react'
import PortalMark from '../../components/PortalMark'
import TabCard from '../../components/TabCard'
import { getUpdates } from '../../services/api'

const kindStyles = {
  deadline: { label: 'Deadline', className: 'bg-flame-wash text-flame-deep' },
  alert: { label: 'Alert', className: 'bg-danger-wash text-danger' },
  update: { label: 'Update', className: 'bg-blue-wash text-blue-deep' },
}

// "in 2 days · Mon, 16 Nov"
function dueText(update) {
  if (update.dueInDays == null) return ''
  const when = update.dueInDays === 0 ? 'today' : update.dueInDays === 1 ? 'tomorrow' : `in ${update.dueInDays} days`
  return `Due ${when} · ${format(new Date(update.dueDate), 'EEE, d MMM')}`
}

// "Your updates": deadlines and messages from all portals, each linked to its task.
// Only the demo account gets them: they are SAMPLE data, because LPU has no public API.
// For every other student the backend returns nothing and this section stays hidden.
export default function DemoUpdates() {
  const [updates, setUpdates] = useState([])

  useEffect(() => {
    let ignore = false
    getUpdates()
      .then((data) => {
        if (!ignore) setUpdates(data.updates)
      })
      .catch(() => {}) // updates are extra; the task list still works without them
    return () => {
      ignore = true
    }
  }, [])

  if (updates.length === 0) return null

  return (
    <TabCard
      title="Your updates"
      icon={Bell}
      count={updates.length}
      className="mt-10"
      action={
        <span className="rounded-full border border-saffron/60 bg-surface px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-flame-deep">
          DEMO DATA
        </span>
      }
    >
      <p className="px-4 pb-3 text-sm text-muted sm:px-5">
        Sample of what an official LPU API would show here: your deadlines and messages from every portal. Each one opens the right task.
      </p>
      <ul className="divide-y divide-line border-t border-line">
        {updates.map((update) => {
          const kind = kindStyles[update.kind] ?? kindStyles.update
          const { task } = update
          return (
            <li
              key={update._id}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-5"
            >
              <PortalMark portal={task.portal} />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${kind.className}`}>{kind.label}</span>
                  <span className="font-semibold text-ink">{update.title}</span>
                </p>
                <p className="mt-0.5 text-sm text-muted">{update.detail}</p>
                {update.dueDate && <p className="mt-1 text-[13px] font-medium text-flame-deep">{dueText(update)}</p>}
              </div>
              <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                <Link
                  to={`/tasks/${task._id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-charcoal hover:border-blue hover:text-blue"
                >
                  <ListOrdered className="size-4" aria-hidden="true" />
                  Steps<span className="sr-only"> for {task.title}</span>
                </Link>
                {task.openUrl && (
                  <a
                    href={task.openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-flame px-3.5 text-sm font-semibold text-white hover:bg-flame-deep"
                  >
                    Open
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                    <span className="sr-only"> {task.title} on {task.portal?.name} (new tab)</span>
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </TabCard>
  )
}
