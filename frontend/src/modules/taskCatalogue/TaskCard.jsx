import { Link } from 'react-router-dom'
import { ArrowUpRight, ListOrdered } from 'lucide-react'
import MenuTrail from '../../components/MenuTrail'
import PortalMark from '../../components/PortalMark'

export default function TaskCard({ task, isPublic = false }) {
  const { portal, openUrl } = task
  const guideLink = isPublic ? `/login?next=${encodeURIComponent(`/tasks/${task._id}`)}` : `/tasks/${task._id}`

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-flame-wash/40 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-5">
      <PortalMark portal={portal} />

      <div className="min-w-0">
        {openUrl ? (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink decoration-flame/50 underline-offset-4 hover:text-flame-deep hover:underline"
          >
            {task.title}
            <span className="sr-only"> (opens {portal?.name} in a new tab)</span>
          </a>
        ) : (
          <Link to={guideLink} className="font-semibold text-ink underline-offset-4 hover:text-flame-deep hover:underline">
            {task.title}
          </Link>
        )}
        <p className="mt-0.5 text-sm text-muted">{task.summary}</p>
        <MenuTrail portal={portal} path={task.menuPath} />
      </div>

      <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
        <Link
          to={guideLink}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-charcoal hover:border-blue hover:text-blue"
        >
          <ListOrdered className="size-4" aria-hidden="true" />
          Steps<span className="sr-only"> for {task.title}</span>
        </Link>
        {openUrl && (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-flame px-3.5 text-sm font-semibold text-white hover:bg-flame-deep"
          >
            Open
            <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only"> {task.title} on {portal?.name} (new tab)</span>
          </a>
        )}
      </div>
    </li>
  )
}
