import { ArrowUpRight, Link2Off } from 'lucide-react'
import { buttonClasses } from '../../../components/ui/buttonStyles'

/**
 * Open Portal (Task 22). Links out ONLY when the service's official URL has been
 * verified by an admin. Otherwise it shows a clearly marked placeholder instead of
 * guessing an address.
 */
export default function OpenPortalButton({ service, variant = 'primary' }) {
  if (!service) return null

  if (service.linkAvailable && service.officialUrl) {
    return (
      <a
        href={service.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses({ variant, size: 'md' })}
      >
        Open {service.shortName || service.name}
        <ArrowUpRight className="size-4" aria-hidden="true" />
        <span className="sr-only">(official site, opens in a new tab)</span>
      </a>
    )
  }

  return (
    <p
      className="inline-flex h-10 items-center gap-2 rounded-sm border border-dashed border-line-strong px-3 text-[13px] text-stone-deep"
      title="This service's official address has not been verified yet, so no link is shown."
    >
      <Link2Off className="size-4 shrink-0" aria-hidden="true" />
      Official link to be verified
    </p>
  )
}
