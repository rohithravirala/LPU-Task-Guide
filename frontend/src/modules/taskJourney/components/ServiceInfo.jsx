import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { Tag, VerificationTag } from '../../../components/ui/Tag'
import { ServiceTypeIcon } from '../../../components/ui/ServiceTypeIcon'
import { ErrorState } from '../../../components/ui/StatusMessage'
import Loader from '../../../components/Loader'
import { serviceTypeLabel } from '../../../utils/serviceTypes'
import { getService } from '../services/journeyService'
import OpenPortalButton from './OpenPortalButton'

/**
 * Service Identifier (Task 21): which university service is responsible for this
 * step, whether its details are verified, and how to reach it. "About" loads the
 * full record (GET /api/services/:id) only when opened.
 */
export default function ServiceInfo({ service, currentTaskId }) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const details = useApiQuery(({ signal }) => getService(service._id, { signal }), [service._id], { enabled: expanded })
  const otherTasks = (details.data?.usedIn ?? []).filter((task) => task._id !== currentTaskId)

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-ink text-paper">
            <ServiceTypeIcon type={service.serviceType} className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="label-mono text-stone">Responsible service</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="font-display text-lg font-semibold text-ink">{service.name}</span>
              <Tag tone="outline">{serviceTypeLabel(service.serviceType)}</Tag>
              <VerificationTag status={service.verificationStatus} subject="service information" />
            </p>
            {service.description && <p className="mt-1 text-sm leading-relaxed text-stone-deep">{service.description}</p>}
          </div>
        </div>
        <div className="shrink-0">
          <OpenPortalButton service={service} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center justify-between border-t border-line px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-paper"
      >
        About {service.shortName || service.name}
        <ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {expanded && (
        <div id={panelId} className="border-t border-line px-4 py-4">
          {details.loading ? (
            <Loader label="Loading service details" />
          ) : details.error ? (
            <ErrorState compact error={details.error} onRetry={details.refetch} />
          ) : (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="label-mono text-stone">How students reach it</dt>
                <dd className="mt-1 leading-relaxed text-charcoal">
                  {details.data?.service.accessNotes || 'Access details have not been added yet.'}
                </dd>
              </div>
              <div>
                <dt className="label-mono text-stone">Official link</dt>
                <dd className="mt-1 text-charcoal">
                  {details.data?.service.linkAvailable ? (
                    <span className="num-mono break-all">{details.data.service.officialUrl}</span>
                  ) : (
                    'Not shown until the official address has been verified.'
                  )}
                </dd>
              </div>
              {otherTasks.length > 0 && (
                <div>
                  <dt className="label-mono text-stone">Also used for</dt>
                  <dd className="mt-1.5">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {otherTasks.slice(0, 6).map((task) => (
                        <li key={task._id}>
                          <Link to={`/tasks/${task.slug}`} className="text-ink underline-offset-4 hover:underline">
                            {task.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
    </div>
  )
}
