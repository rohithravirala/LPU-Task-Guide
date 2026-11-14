import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { CategoryCode } from '../../../components/ui/Tag'
import { EmptyState, ErrorState } from '../../../components/ui/StatusMessage'
import { Skeleton } from '../../../components/Loader'
import { stationNumber } from '../../../utils/formatDate'
import { usePopularTasks } from '../hooks/usePopularTasks'
import { useTasks } from '../hooks/useTasks'

/**
 * Quick access to the tasks most students open (Task 10). While nobody has opened
 * anything yet, it honestly falls back to admin-recommended tasks instead of
 * pretending to have popularity data.
 */
export default function PopularTasks({ limit = 5, index = '02' }) {
  const popular = usePopularTasks(limit)
  const noActivityYet = !popular.loading && !popular.error && popular.data?.length === 0
  const featured = useTasks({ featured: true, limit, enabled: noActivityYet })

  const source = noActivityYet ? featured : popular
  const tasks = noActivityYet ? featured.data?.items : popular.data
  const loading = popular.loading || (noActivityYet && featured.loading)

  return (
    <section aria-labelledby="popular-tasks-title">
      <SectionHeader
        index={index}
        eyebrow="Quick access"
        title={<span id="popular-tasks-title">{noActivityYet ? 'Recommended starting points' : 'Most opened'}</span>}
        description={
          noActivityYet
            ? 'Popular tasks will appear here once students start opening them.'
            : 'The tasks students open most often.'
        }
      />
      <div className="mt-5">
        {loading && !tasks ? (
          <ul className="divide-y divide-line border-y border-line">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="flex items-center gap-4 py-3.5">
                <Skeleton className="h-6 w-7" />
                <Skeleton className="h-4 flex-1" />
              </li>
            ))}
          </ul>
        ) : source.error ? (
          <ErrorState compact error={source.error} onRetry={source.refetch} />
        ) : !tasks?.length ? (
          <EmptyState compact icon={Compass} title="Nothing to show yet" description="Browse the catalogue to find a task." />
        ) : (
          <ol className="divide-y divide-line border-y border-line">
            {tasks.map((task, i) => (
              <li key={task._id} className="group relative flex items-center gap-4 py-3.5 pr-1">
                <span className="num-mono w-7 shrink-0 text-lg font-medium text-stone">{stationNumber(i + 1)}</span>
                <span className="min-w-0 flex-1">
                  <Link
                    to={`/tasks/${task.slug}`}
                    className="block truncate text-[15px] font-medium text-ink decoration-ink/40 underline-offset-4 after:absolute after:inset-0 group-hover:underline"
                  >
                    {task.title}
                  </Link>
                  <span className="block text-[12px] text-stone-deep">
                    {noActivityYet
                      ? `${task.stepCount} steps · ${task.category?.name}`
                      : `Opened by ${task.viewerCount} student${task.viewerCount === 1 ? '' : 's'}`}
                  </span>
                </span>
                <CategoryCode code={task.category?.code} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
