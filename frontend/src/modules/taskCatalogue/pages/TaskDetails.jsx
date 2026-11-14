import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ChevronRight, CircleDashed, Pencil, SearchX, TriangleAlert } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { ButtonLink } from '../../../components/ui/Button'
import { CategoryCode, Tag, VerificationTag } from '../../../components/ui/Tag'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { EmptyState, ErrorState, Notice } from '../../../components/ui/StatusMessage'
import { ServiceTypeIcon } from '../../../components/ui/ServiceTypeIcon'
import { Skeleton } from '../../../components/Loader'
import { formatDuration, stationNumber } from '../../../utils/formatDate'
import { peekProgress } from '../../taskJourney/services/journeyProgress'
import TaskInfo from '../components/TaskInfo'
import { useTask } from '../hooks/useTasks'

/** Read-only outline of the journey so students see the whole route before starting. */
function RouteOutline({ steps }) {
  return (
    <ol className="border-y border-line">
      {steps.map((step, index) => (
        <li key={step._id} className="relative flex gap-4 py-3.5">
          {index < steps.length - 1 && (
            <span aria-hidden="true" className="absolute top-10 bottom-0 left-[13px] border-l-2 border-dashed border-line-strong" />
          )}
          <span
            className={`num-mono relative flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-semibold text-ink ${
              step.isRequired ? 'border-2 border-ink' : 'border-2 border-dashed border-line-strong'
            }`}
          >
            {stationNumber(step.order)}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
              {step.title}
              {!step.isRequired && <Tag>Optional</Tag>}
            </p>
            {step.service && (
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-stone-deep">
                <ServiceTypeIcon type={step.service.serviceType} className="size-3.5" />
                {step.service.name}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

function DetailsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading task" className="space-y-6">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-5 w-full max-w-2xl" />
      <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  )
}

export default function TaskDetails() {
  const { slug } = useParams()
  const { user, isAdmin } = useAuth()
  const { data, loading, error, refetch } = useTask(slug)
  useDocumentTitle(data?.task?.title ?? 'Task')

  if (loading && !data) return <DetailsSkeleton />

  if (error) {
    return error.isNotFound ? (
      <EmptyState
        icon={SearchX}
        title="This task is not available"
        description="It may have been removed or renamed. Search the catalogue for what you need to do."
        action={
          <ButtonLink to="/tasks" variant="secondary" size="sm">
            Go to the catalogue
          </ButtonLink>
        }
      />
    ) : (
      <ErrorState error={error} onRetry={refetch} />
    )
  }

  const { task, steps, services, summary, related } = data
  const journeyPath = `/tasks/${task.slug}/journey`
  const saved = peekProgress({ userId: user?._id, taskId: task._id })
  const doneCount = saved?.completedStepIds.filter((id) => steps.some((step) => step._id === id)).length ?? 0
  const startLabel = doneCount > 0 ? `Resume journey · ${doneCount}/${steps.length} done` : 'Start journey'
  const duration = formatDuration(task.estimatedDuration)

  return (
    <article>
      <nav aria-label="Breadcrumb">
        <ol className="label-mono flex flex-wrap items-center gap-1.5 text-stone-deep">
          <li>
            <Link to="/tasks" className="hover:text-ink hover:underline">
              Catalogue
            </Link>
          </li>
          <ChevronRight className="size-3" aria-hidden="true" />
          <li>
            <Link to={`/tasks?category=${task.category?.slug}`} className="hover:text-ink hover:underline">
              {task.category?.name}
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mt-5 grid gap-6 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryCode code={task.category?.code} />
            <VerificationTag status={task.verificationStatus} />
            {!task.isActive && <Tag tone="vermilion">Hidden from students</Tag>}
          </div>
          <h1 className="mt-4 text-[30px] leading-tight font-semibold sm:text-[40px]">{task.title}</h1>
          <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-stone-deep">{task.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-charcoal">
            <li className="num-mono">{summary.totalSteps} steps</li>
            {duration && <li className="num-mono">{duration}</li>}
            {task.primaryService && (
              <li className="flex items-center gap-1.5 font-medium text-ink">
                <ServiceTypeIcon type={task.primaryService.serviceType} className="size-4" />
                {task.primaryService.name}
              </li>
            )}
          </ul>
        </div>
        <div className="flex flex-wrap gap-3 lg:flex-col lg:items-stretch">
          <ButtonLink to={journeyPath} size="lg" iconRight={ArrowRight} aria-disabled={steps.length === 0 || undefined}>
            {startLabel}
          </ButtonLink>
          {isAdmin && (
            <ButtonLink to={`/admin/tasks/${task._id}/edit`} variant="secondary" icon={Pencil}>
              Edit task
            </ButtonLink>
          )}
        </div>
      </header>

      {task.verificationStatus !== 'verified' && (
        <Notice icon={CircleDashed} title="Illustrative guidance, not yet verified" className="mt-6">
          These steps have not been verified against official university procedures yet. Use them for orientation and
          confirm details with the responsible service before acting.
        </Notice>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="about-title">
            <SectionHeader index="01" eyebrow="About this task" title={<span id="about-title">What it involves</span>} />
            <p className="mt-4 max-w-prose text-[15px] leading-relaxed whitespace-pre-line text-charcoal">{task.description}</p>
            {task.purpose && (
              <div className="mt-6 max-w-prose border-l-[3px] border-chartreuse bg-surface py-3 pr-4 pl-4">
                <p className="label-mono text-stone-deep">Why it matters</p>
                <p className="mt-1 text-[15px] leading-relaxed text-charcoal">{task.purpose}</p>
              </div>
            )}
          </section>

          <section aria-labelledby="route-title">
            <SectionHeader
              index="02"
              eyebrow="Route overview"
              title={<span id="route-title">{summary.totalSteps} steps from start to finish</span>}
              description={
                summary.optionalSteps > 0
                  ? `${summary.requiredSteps} required and ${summary.optionalSteps} optional. Dashed stations are optional.`
                  : 'Follow them in order. Each step names the service responsible for it.'
              }
            />
            <div className="mt-5">
              {steps.length ? (
                <RouteOutline steps={steps} />
              ) : (
                <EmptyState compact title="No steps yet" description="This task has no journey steps yet." />
              )}
            </div>
            {steps.length > 0 && (
              <ButtonLink to={journeyPath} variant="secondary" className="mt-5" iconRight={ArrowRight}>
                {doneCount > 0 ? 'Resume journey' : 'Start this journey'}
              </ButtonLink>
            )}
          </section>

          {task.importantNotes?.length > 0 && (
            <section aria-labelledby="notes-title">
              <SectionHeader index="03" eyebrow="Important" title={<span id="notes-title">Read before you start</span>} />
              <ul className="mt-5 divide-y divide-line border border-line bg-surface">
                {task.importantNotes.map((note) => (
                  <li key={note} className="flex gap-3 px-4 py-3 text-[15px] leading-relaxed text-charcoal">
                    <TriangleAlert className="mt-1 size-4 shrink-0 text-vermilion-deep" aria-hidden="true" />
                    {note}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Slot: Module 3 — related FAQs and notices for this task (GET /api/faqs?taskId=…) */}
        </div>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <TaskInfo task={task} summary={summary} services={services} />

          {related.length > 0 && (
            <section aria-labelledby="related-title">
              <h2 id="related-title" className="label-mono font-display text-stone-deep">
                Related tasks
              </h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {related.map((item) => (
                  <li key={item._id}>
                    <Link to={`/tasks/${item.slug}`} className="group flex items-center gap-3 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink group-hover:underline">{item.title}</span>
                        <span className="num-mono block text-[12px] text-stone">{item.stepCount} steps</span>
                      </span>
                      <ArrowRight className="size-4 text-stone-deep transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  )
}
