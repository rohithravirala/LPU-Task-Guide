import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, PartyPopper } from 'lucide-react'
import JourneySteps from './JourneySteps'
import FAQ from '../studentHelp/FAQ'
import { getErrorMessage, getJourney } from '../../services/api'

// The student's own ticks are saved in this browser (localStorage).
// They never tell the university that anything was completed.
function loadDoneSteps(taskId) {
  try {
    return JSON.parse(localStorage.getItem(`journey-${taskId}`)) ?? []
  } catch {
    return []
  }
}

// MODULE 2 – Task Journey Engine: the step-by-step guide for one task.
export default function JourneyPage() {
  const { taskId } = useParams()
  const [journey, setJourney] = useState(null)
  const [error, setError] = useState('')
  const [doneSteps, setDoneSteps] = useState(() => loadDoneSteps(taskId)) // ids of finished steps

  useEffect(() => {
    let ignore = false
    getJourney(taskId)
      .then((data) => {
        if (!ignore) setJourney(data)
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err))
      })
    return () => {
      ignore = true
    }
  }, [taskId])

  function toggleStep(stepId) {
    const updated = doneSteps.includes(stepId) ? doneSteps.filter((id) => id !== stepId) : [...doneSteps, stepId]
    setDoneSteps(updated)
    localStorage.setItem(`journey-${taskId}`, JSON.stringify(updated))
  }

  if (error) return <p role="alert" className="rounded-lg bg-vermilion-wash px-4 py-3 text-vermilion-deep">{error}</p>
  if (!journey) return <p className="text-stone-deep">Loading…</p>

  const { task, steps } = journey
  const doneCount = steps.filter((step) => doneSteps.includes(step._id)).length
  const percent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0
  // The step to do now = the first required step that is not done yet
  const currentStep = steps.find((step) => !step.isOptional && !doneSteps.includes(step._id))

  return (
    <div className="max-w-3xl">
      <Link to={`/tasks/${task._id}`} className="inline-flex items-center gap-1.5 text-stone-deep hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to task
      </Link>

      <h1 className="mt-6 text-3xl font-bold">{task.title}</h1>
      <p className="mt-2 text-stone-deep">Do these steps in order. Tick each one when you finish it.</p>

      {/* Progress */}
      <div className="mt-6 rounded-xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-ink">
            {doneCount} of {steps.length} steps done
          </p>
          <p className="font-bold text-ink">{percent}%</p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-chartreuse transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-stone-deep">Your ticks are saved on this device only.</p>
      </div>

      {!currentStep && (
        <p className="mt-6 flex items-center gap-3 rounded-xl bg-chartreuse-wash px-5 py-4 font-semibold text-ink">
          <PartyPopper className="size-5" aria-hidden="true" /> You have finished all the required steps!
        </p>
      )}

      <JourneySteps steps={steps} doneSteps={doneSteps} currentStepId={currentStep?._id} onToggle={toggleStep} />

      {/* Module 3 inside Module 2: questions about this task */}
      <div className="mt-12">
        <FAQ taskId={task._id} title="Common questions about this task" />
      </div>
    </div>
  )
}
