import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, CircleCheck, ClipboardList, Info, ListOrdered, ShieldCheck, Signpost } from 'lucide-react'
import MenuTrail from '../../components/MenuTrail'
import PortalMark from '../../components/PortalMark'
import TabCard from '../../components/TabCard'
import { hostOf, openLabel } from '../../lib/portal'
import { getErrorMessage, getJourney } from '../../services/api'

export default function TaskDetails() {
  const { taskId } = useParams()
  const [journey, setJourney] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    getJourney(taskId)
      .then((data) => { if (!ignore) setJourney(data) })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)) })
    return () => { ignore = true }
  }, [taskId])

  if (error) {
    return (
      <div>
        <p role="alert" className="rounded-xl bg-danger-wash px-4 py-3 text-danger">{error}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-flame-deep underline">Back to all tasks</Link>
      </div>
    )
  }
  if (!journey) return <p className="text-muted">Loading…</p>

  const { task, steps } = journey
  const { portal } = task

  return (
    <article className="max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-muted hover:text-flame-deep">
        <ArrowLeft className="size-4" aria-hidden="true" /> All tasks
      </Link>

      <header className="mt-6 flex items-start gap-4 sm:gap-5">
        <PortalMark portal={portal} size="lg" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-flame-deep">{task.category}</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{task.title}</h1>
          <p className="mt-3 text-lg text-charcoal">{task.description}</p>
        </div>
      </header>

      {portal && task.openUrl && (
        <TabCard title={`Where to find it on ${portal.name}`} icon={Signpost} className="mt-12">
          <div className="px-5 pb-6 sm:px-6">
            {task.menuPath?.length > 0 ? (
              <MenuTrail portal={portal} path={task.menuPath} large />
            ) : (
              <p className="text-charcoal">Open {portal.name}; the steps below show what to do there.</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-5">
              <a
                href={task.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-flame px-6 text-base font-semibold text-white shadow-sm shadow-flame/30 hover:bg-flame-deep"
              >
                {openLabel(portal)} <ArrowUpRight className="size-5" aria-hidden="true" />
                <span className="sr-only">(new tab)</span>
              </a>
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <ShieldCheck className="size-4 text-leaf" aria-hidden="true" />
                Opens the official {hostOf(task.openUrl)} in a new tab
              </p>
            </div>

            {task.menuPath?.length > 0 && (
              <p className="mt-3 text-sm text-muted">
                {task.url
                  ? `Goes straight to this page when you are already logged in to ${portal.name}. If it asks you to log in first, follow the path above after logging in.`
                  : `${portal.name} opens on its home page. After you log in, follow the path above.`}
              </p>
            )}
            {portal.alternateUrl && (
              <a
                href={portal.alternateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-blue hover:underline"
              >
                On iPhone? {portal.alternateLabel} ↗
              </a>
            )}
          </div>
        </TabCard>
      )}

      <div className={`mt-12 grid items-start gap-x-6 gap-y-12 ${task.requirements?.length ? 'md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : ''}`}>
        {task.requirements?.length > 0 && (
          <TabCard title="Keep ready" icon={ClipboardList}>
            <ul className="space-y-2.5 px-5 pb-5">
              {task.requirements.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </TabCard>
        )}

        <TabCard title="What you will do" icon={ListOrdered} count={steps.length}>
          {task.estimatedMinutes && <p className="-mt-1 mb-3 px-5 text-sm text-muted">About {task.estimatedMinutes} minutes</p>}
          <ol className="space-y-3 px-5 pb-5">
            {steps.map((step) => (
              <li key={step._id} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-flame-wash text-sm font-bold text-flame-deep">
                  {step.order}
                </span>
                <span className="pt-0.5">
                  <span className="font-semibold text-ink">{step.title}</span>
                  {step.isOptional && <span className="text-muted"> (optional)</span>}
                  {step.service && step.service._id !== portal?._id && (
                    <span className="block text-sm text-muted">Where: {step.service.name}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </TabCard>
      </div>

      <Link
        to={`/tasks/${task._id}/journey`}
        className="mt-10 inline-flex h-12 items-center gap-2 rounded-xl bg-navy px-6 text-base font-semibold text-white hover:bg-ink"
      >
        Start step-by-step guide <ArrowRight className="size-5" aria-hidden="true" />
      </Link>

      <p className="mt-6 flex gap-2 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        These steps are general guidance. Always check the official portal or office for final details.
      </p>
    </article>
  )
}
