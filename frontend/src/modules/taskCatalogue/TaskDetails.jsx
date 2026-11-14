import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CircleCheck, Info } from 'lucide-react'
import { getErrorMessage, getJourney } from '../../services/api'

// Explains a task BEFORE the student starts it: what it is, what to keep ready, the steps.
export default function TaskDetails() {
  const { taskId } = useParams() // the :taskId part of the URL
  const [journey, setJourney] = useState(null)
  const [error, setError] = useState('')

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

  if (error) {
    return (
      <div>
        <p role="alert" className="rounded-lg bg-vermilion-wash px-4 py-3 text-vermilion-deep">{error}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-ink underline">Back to all tasks</Link>
      </div>
    )
  }
  if (!journey) return <p className="text-stone-deep">Loading…</p>

  const { task, steps } = journey

  return (
    <article className="max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-stone-deep hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> All tasks
      </Link>

      <p className="mt-6 text-sm font-semibold text-vermilion-deep">{task.category}</p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{task.title}</h1>
      <p className="mt-4 text-lg text-charcoal">{task.description}</p>

      {task.requirements?.length > 0 && (
        <section className="mt-8 rounded-xl border border-line bg-surface p-6">
          <h2 className="text-lg font-bold">Before you start, keep ready</h2>
          <ul className="mt-3 space-y-2">
            {task.requirements.map((item) => (
              <li key={item} className="flex gap-2.5">
                <CircleCheck className="mt-1 size-5 shrink-0 text-chartreuse" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold">
          What you will do ({steps.length} steps{task.estimatedMinutes ? `, about ${task.estimatedMinutes} minutes` : ''})
        </h2>
        <ol className="mt-4 space-y-3">
          {steps.map((step) => (
            <li key={step._id} className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">
                {step.order}
              </span>
              <span className="pt-1">
                <span className="font-semibold text-ink">{step.title}</span>
                {step.isOptional && <span className="text-stone-deep"> (optional)</span>}
                {step.service && <span className="block text-sm text-stone-deep">Where: {step.service.name}</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Link
        to={`/tasks/${task._id}/journey`}
        className="mt-10 inline-flex h-13 items-center gap-2 rounded-lg bg-ink px-7 text-lg font-semibold text-paper hover:bg-ink-deep"
      >
        Start step-by-step guide <ArrowRight className="size-5" aria-hidden="true" />
      </Link>

      <p className="mt-6 flex gap-2 text-sm text-stone-deep">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        These steps are general guidance. Always check the official university website or office for final details.
      </p>
    </article>
  )
}
