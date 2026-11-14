import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { getErrorMessage, getServices } from '../../services/api'

// What to do when stuck (the same advice for every student)
const whenStuck = [
  'Open your task and follow the steps in order.',
  'Look for your problem in the common questions.',
  'Contact the place written under "Where" in the step you are stuck on.',
  'Still stuck? Go to the Student Help Desk with a screenshot of the problem.',
]

// "If you are stuck" advice + the list of university services (from the database).
export default function HelpGuidance() {
  const [services, setServices] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    getServices()
      .then((data) => {
        if (!ignore) setServices(data)
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err))
      })
    return () => {
      ignore = true
    }
  }, [])

  return (
    <aside className="space-y-8">
      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-lg font-bold">If you are stuck</h2>
        <ol className="mt-4 space-y-3">
          {whenStuck.map((advice, index) => (
            <li key={advice} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">
                {index + 1}
              </span>
              {advice}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-bold">Where to go for what</h2>
        {error && <p role="alert" className="mt-3 text-vermilion-deep">{error}</p>}
        <ul className="mt-4 space-y-3">
          {services.map((service) => (
            <li key={service._id} className="rounded-xl border border-line bg-surface px-5 py-4">
              <p className="font-semibold text-ink">{service.name}</p>
              <p className="mt-0.5 text-sm text-stone-deep">{service.description}</p>
              {service.url && (
                <a href={service.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ink underline">
                  Open <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
