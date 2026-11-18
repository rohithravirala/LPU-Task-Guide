import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, PartyPopper } from 'lucide-react'
import JourneySteps from './JourneySteps'
import FAQ from '../studentHelp/FAQ'
import PortalMark from '../../components/PortalMark'
import { openLabel } from '../../lib/portal'
import { getErrorMessage, getJourney } from '../../services/api'

function loadDoneSteps(taskId) {
  try {
    return JSON.parse(localStorage.getItem(`journey-${taskId}`)) ?? []
  } catch {
    return []
  }
}

export default function JourneyPage() {
  const { taskId } = useParams()
  const [journey, setJourney] = useState(null)
  const [error, setError] = useState('')
  const [doneSteps, setDoneSteps] = useState(() => loadDoneSteps(taskId))

  useEffect(() => {
    let ignore = false
    getJourney(taskId)
      .then((data) => { if (!ignore) setJourney(data) })
      .catch((err) => { if (!ignore) setError(getErrorMessage(err)) })
    return () => { ignore = true }
  }, [taskId])

  function toggleStep(stepId) {
    const updated = doneSteps.includes(stepId) ? doneSteps.filter((id) => id !== stepId) : [...doneSteps, stepId]
    setDoneSteps(updated)
    try {
      localStorage.setItem(`journey-${taskId}`, JSON.stringify(updated))
    } catch {
      return
    }
  }

  if (error) return <p role="alert" className="rounded-xl bg-danger-wash px-4 py-3 text-danger">{error}</p>
  if (!journey) return <p className="text-muted">Loading…</p>

  const { task, steps } = journey
  const doneCount = steps.filter((step) => doneSteps.includes(step._id)).length
  const percent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0
  const currentStep = steps.find((step) => !step.isOptional && !doneSteps.includes(step._id))

  return (
    <div className="max-w-3xl">
      <Link to={`/tasks/${task._id}`} className="inline-flex items-center gap-1.5 text-muted hover:text-flame-deep">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to task
      </Link>

      <header className="mt-6 flex items-start gap-4">
        <PortalMark portal={task.portal} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">{task.title}</h1>
          <p className="mt-1.5 text-muted">Do these steps in order. Tick each one when you finish it.</p>
        </div>
      </header>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-ink">
            {doneCount} of {steps.length} steps done
          </p>
          <div className="flex items-center gap-4">
            {task.openUrl && (
              <a
                href={task.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-flame-deep hover:underline"
              >
                {openLabel(task.portal)} <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only">(new tab)</span>
              </a>
            )}
            <p className="text-lg font-bold text-ink">{percent}%</p>
          </div>
        </div>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-flame-wash"
          role="progressbar"
          aria-label="Steps done"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-flame transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">Your ticks are saved on this device only.</p>
      </div>

      {!currentStep && (
        <p className="mt-6 flex items-center gap-3 rounded-2xl bg-leaf-wash px-5 py-4 font-semibold text-leaf">
          <PartyPopper className="size-5" aria-hidden="true" /> You have finished all the required steps!
        </p>
      )}

      <JourneySteps
        steps={steps}
        portalId={task.portal?._id}
        doneSteps={doneSteps}
        currentStepId={currentStep?._id}
        onToggle={toggleStep}
      />

      <div className="mt-14">
        <FAQ taskId={task._id} title="Questions about this task" />
      </div>
    </div>
  )
}
