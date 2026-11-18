import { useEffect, useState } from 'react'
import { ArrowUpRight, Building2, LifeBuoy, MapPin } from 'lucide-react'
import PortalMark from '../../components/PortalMark'
import TabCard from '../../components/TabCard'
import { getErrorMessage, getServices } from '../../services/api'

const whenStuck = [
  'Open your task and follow the steps in order.',
  'Look for your problem in the common questions.',
  'Contact the place written under "Where" in the step you are stuck on.',
  'Still stuck? Go to the Student Help Desk with a screenshot of the problem.',
]

export default function HelpGuidance() {
  const [services, setServices] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  return (
    <aside className="space-y-12">
      <TabCard title="If you are stuck" icon={LifeBuoy}>
        <ol className="space-y-3 px-5 pb-5">
          {whenStuck.map((advice, index) => (
            <li key={advice} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-flame text-sm font-bold text-white">
                {index + 1}
              </span>
              {advice}
            </li>
          ))}
        </ol>
      </TabCard>

      <TabCard title="Where to go for what" icon={MapPin}>
        {error && <p role="alert" className="px-5 pb-4 text-danger">{error}</p>}
        <ul className="divide-y divide-line">
          {services.map((service) => (
            <li key={service._id} className="flex items-start gap-3 px-5 py-3.5">
              {service.isPortal ? (
                <PortalMark portal={service} size="sm" />
              ) : (
                <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-paper text-muted ring-1 ring-line ring-inset">
                  <Building2 className="size-4" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{service.name}</p>
                <p className="text-sm text-muted">{service.description}</p>
                {service.url && (
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue hover:underline"
                  >
                    Open {service.name} <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(new tab)</span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </TabCard>
    </aside>
  )
}
