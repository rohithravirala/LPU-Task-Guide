import { Link } from 'react-router-dom'
import { ArrowRight, Clock, ListOrdered, MapPin } from 'lucide-react'

// One task. Clicking it opens the task details page.
export default function TaskCard({ task }) {
  const places = task.services?.slice(0, 2).join(', ')

  return (
    <Link
      to={`/tasks/${task._id}`}
      className="group flex flex-col rounded-xl border border-line bg-surface p-6 transition hover:border-ink hover:shadow-md"
    >
      <h3 className="text-lg font-bold">{task.title}</h3>
      <p className="mt-1.5 text-stone-deep">{task.summary}</p>

      <ul className="mt-4 space-y-1.5 text-sm text-charcoal">
        <li className="flex items-center gap-2">
          <ListOrdered className="size-4 text-stone-deep" aria-hidden="true" />
          {task.stepCount} simple steps
        </li>
        {task.estimatedMinutes && (
          <li className="flex items-center gap-2">
            <Clock className="size-4 text-stone-deep" aria-hidden="true" />
            About {task.estimatedMinutes} minutes
          </li>
        )}
        {places && (
          <li className="flex items-center gap-2">
            <MapPin className="size-4 text-stone-deep" aria-hidden="true" />
            You will use: {places}
          </li>
        )}
      </ul>

      <span className="mt-5 flex items-center gap-1.5 font-semibold text-ink">
        See the steps
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  )
}
