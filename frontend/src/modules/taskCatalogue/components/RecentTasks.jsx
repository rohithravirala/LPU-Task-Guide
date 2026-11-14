import { Link } from 'react-router-dom'
import { ArrowRight, History } from 'lucide-react'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { CategoryCode } from '../../../components/ui/Tag'
import { ButtonLink } from '../../../components/ui/Button'
import { EmptyState, ErrorState } from '../../../components/ui/StatusMessage'
import { Skeleton } from '../../../components/Loader'
import { formatRelativeTime } from '../../../utils/formatDate'
import { useRecentTasks } from '../hooks/useRecentTasks'

/** The student's recently opened tasks, newest first (Task 11). */
export default function RecentTasks({ limit = 5, index = '01' }) {
  const { data, loading, error, refetch } = useRecentTasks(limit)

  return (
    <section aria-labelledby="recent-tasks-title">
      <SectionHeader
        index={index}
        eyebrow="Your activity"
        title={<span id="recent-tasks-title">Recently opened</span>}
        description="Pick up a task where you left it."
      />
      <div className="mt-5">
        {loading && !data ? (
          <ul className="divide-y divide-line border-y border-line">
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="flex items-center gap-4 py-4">
                <Skeleton className="h-6 w-11" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <ErrorState compact error={error} onRetry={refetch} />
        ) : !data?.length ? (
          <EmptyState
            compact
            icon={History}
            title="No tasks opened yet"
            description="Tasks you open appear here, so you can get back to them in one click."
            action={
              <ButtonLink to="/tasks" variant="secondary" size="sm" iconRight={ArrowRight}>
                Browse tasks
              </ButtonLink>
            }
          />
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {data.map(({ task, lastViewedAt, viewCount }) => (
              <li key={task._id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 sm:flex-nowrap">
                <CategoryCode code={task.category?.code} />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/tasks/${task.slug}`}
                    className="block truncate text-[15px] font-medium text-ink underline-offset-4 hover:underline"
                  >
                    {task.title}
                  </Link>
                  <p className="text-[12px] text-stone-deep">
                    Opened {formatRelativeTime(lastViewedAt)}
                    {viewCount > 1 && ` · ${viewCount} visits`}
                  </p>
                </div>
                <Link
                  to={`/tasks/${task.slug}/journey`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-1 text-[13px] font-medium text-ink hover:bg-paper-deep"
                >
                  Continue journey
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
