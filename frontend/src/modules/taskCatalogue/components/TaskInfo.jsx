import { Square } from 'lucide-react'
import { CategoryCode, VerificationTag } from '../../../components/ui/Tag'
import { ServiceTypeIcon } from '../../../components/ui/ServiceTypeIcon'
import { serviceTypeLabel } from '../../../utils/serviceTypes'
import { formatDate, formatDuration } from '../../../utils/formatDate'

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 px-5 py-3">
      <dt className="label-mono pt-0.5 text-stone">{label}</dt>
      <dd className="text-sm text-charcoal">{children}</dd>
    </div>
  )
}

function ServiceLine({ service }) {
  return (
    <span className="flex items-start gap-2">
      <ServiceTypeIcon type={service.serviceType} className="mt-0.5 size-4 shrink-0 text-ink" />
      <span>
        <span className="font-medium text-ink">{service.name}</span>
        <span className="block text-[12px] text-stone">
          {serviceTypeLabel(service.serviceType)}
          {service.stepCount > 0 && ` · used in ${service.stepCount} step${service.stepCount === 1 ? '' : 's'}`}
          {!service.linkAvailable && ' · link to be verified'}
        </span>
      </span>
    </span>
  )
}

/**
 * Task Reference: a spec sheet with the facts a student needs before starting —
 * category, services, number of steps, time and what to prepare.
 */
export default function TaskInfo({ task, summary, services = [] }) {
  const duration = formatDuration(task.estimatedDuration)
  const primary = services.find((service) => service.isPrimary)
  const others = services.filter((service) => !service.isPrimary)

  return (
    <section aria-labelledby="task-reference-title" className="border border-line bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h2 id="task-reference-title" className="label-mono font-display text-ink">
          Task reference
        </h2>
        <VerificationTag status={task.verificationStatus} />
      </header>

      <dl className="divide-y divide-line">
        <Row label="Category">
          <span className="flex items-center gap-2">
            <CategoryCode code={task.category?.code} />
            {task.category?.name}
          </span>
        </Row>
        <Row label="Journey">
          <span className="num-mono font-medium text-ink">{summary?.totalSteps ?? 0} steps</span>
          {summary?.optionalSteps > 0 && (
            <span className="block text-[12px] text-stone">
              {summary.requiredSteps} required · {summary.optionalSteps} optional
            </span>
          )}
        </Row>
        <Row label="Time">
          {duration ? (
            <>
              <span className="num-mono font-medium text-ink">{duration}</span>
              <span className="block text-[12px] text-stone">Estimate for following this guide</span>
            </>
          ) : (
            <span className="text-stone">Not estimated</span>
          )}
        </Row>
        {primary && (
          <Row label="Main service">
            <ServiceLine service={primary} />
          </Row>
        )}
        {others.length > 0 && (
          <Row label="Also involves">
            <ul className="space-y-2">
              {others.map((service) => (
                <li key={service._id}>
                  <ServiceLine service={service} />
                </li>
              ))}
            </ul>
          </Row>
        )}
        {task.updatedAt && (
          <Row label="Updated">
            <span className="num-mono text-[13px]">{formatDate(task.updatedAt)}</span>
          </Row>
        )}
      </dl>

      {task.requirements?.length > 0 && (
        <div className="border-t border-line px-5 py-4">
          <h3 className="label-mono text-stone">Before you start</h3>
          <ul className="mt-3 space-y-2.5">
            {task.requirements.map((requirement) => (
              <li key={requirement} className="flex items-start gap-2.5 text-sm text-charcoal">
                <Square className="mt-0.5 size-4 shrink-0 text-line-strong" aria-hidden="true" />
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
