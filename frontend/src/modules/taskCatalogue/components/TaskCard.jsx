import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CategoryCode, VerificationTag } from '../../../components/ui/Tag'
import { ServiceTypeIcon } from '../../../components/ui/ServiceTypeIcon'
import { formatDuration, stationNumber } from '../../../utils/formatDate'

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Marks search terms inside a title. */
function Highlight({ text, terms }) {
  const usable = (terms ?? []).filter((term) => term.length > 1)
  if (!usable.length) return text
  const parts = text.split(new RegExp(`(${usable.map(escapeRegExp).join('|')})`, 'ig'))
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="rounded-xs bg-chartreuse-wash text-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

function MetaLine({ task, extra }) {
  const duration = formatDuration(task.estimatedDuration)
  const requirementCount = task.requirements?.length ?? 0
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-stone-deep">
      {task.primaryService && (
        <li className="inline-flex items-center gap-1.5 font-medium text-ink">
          <ServiceTypeIcon type={task.primaryService.serviceType} className="size-3.5" />
          {task.primaryService.name}
        </li>
      )}
      {typeof task.stepCount === 'number' && <li className="num-mono">{plural(task.stepCount, 'step')}</li>}
      {duration && <li className="num-mono">{duration}</li>}
      {requirementCount > 0 && <li>{requirementCount} to prepare</li>}
      {extra}
    </ul>
  )
}

const stretchedLink =
  'after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-vermilion'

/**
 * Task entry in the catalogue.
 *  - variant "row":  handbook index row (catalogue, search results)
 *  - variant "tile": compact block for dashboards and the landing page
 */
export default function TaskCard({
  task,
  variant = 'row',
  highlight,
  rank,
  extraMeta,
  journeyLink = true,
  showCategoryLabel = true,
}) {
  const detailsPath = `/tasks/${task.slug}`

  if (variant === 'tile') {
    return (
      <article className="group relative flex h-full flex-col bg-surface p-5 transition-colors hover:bg-paper">
        <div className="flex items-center justify-between gap-3">
          <CategoryCode code={task.category?.code} />
          {rank ? (
            <span className="num-mono text-lg font-medium text-stone">{stationNumber(rank)}</span>
          ) : (
            <span className="label-mono text-stone-deep">{task.category?.name}</span>
          )}
        </div>
        <h3 className="mt-4 text-base leading-snug font-semibold">
          <Link to={detailsPath} className={`decoration-ink/40 underline-offset-4 group-hover:underline ${stretchedLink}`}>
            {task.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-stone-deep">{task.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <MetaLine task={{ ...task, requirements: [] }} extra={extraMeta} />
          <ArrowRight
            className="size-4 shrink-0 text-ink transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </article>
    )
  }

  return (
    <article className="group relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 px-1 py-5 transition-colors hover:bg-surface sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-6 sm:px-4">
      <div className="pt-0.5">
        {rank ? (
          <span className="num-mono block w-11 text-2xl font-medium text-stone">{stationNumber(rank)}</span>
        ) : (
          <CategoryCode code={task.category?.code} />
        )}
      </div>

      <div className="min-w-0">
        {(showCategoryLabel || task.verificationStatus === 'verified' || task.isActive === false) && (
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {showCategoryLabel && <p className="label-mono text-stone-deep">{task.category?.name}</p>}
            {task.verificationStatus === 'verified' && <VerificationTag status="verified" />}
            {task.isActive === false && <span className="label-mono text-vermilion-deep">Hidden</span>}
          </div>
        )}
        <h3 className="text-[17px] leading-snug font-semibold">
          <Link to={detailsPath} className={`decoration-ink/40 underline-offset-4 group-hover:underline ${stretchedLink}`}>
            <Highlight text={task.title} terms={highlight} />
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-relaxed text-stone-deep">{task.summary}</p>
        <div className="mt-3">
          <MetaLine task={task} extra={extraMeta} />
        </div>
      </div>

      {journeyLink && (
        <div className="relative z-10 col-start-2 mt-4 sm:col-start-3 sm:mt-0 sm:self-center">
          <Link
            to={`${detailsPath}/journey`}
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
          >
            Start journey
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </article>
  )
}
