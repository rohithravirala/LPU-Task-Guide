import { Skeleton } from '../../../components/Loader'
import { formatRelativeTime } from '../../../utils/formatDate'

/**
 * Compact, real numbers from GET /api/dashboard: what the catalogue covers and how
 * much of it this student has explored. No decorative charts.
 */
export default function TaskStatistics({ stats, loading = false }) {
  const cells = stats
    ? [
        { value: stats.tasks, label: 'Tasks in the catalogue' },
        { value: stats.categories, label: 'Categories' },
        {
          value: stats.services,
          label: 'University services mapped',
          note: `${stats.verifiedServices} with verified links`,
        },
        {
          value: stats.tasksExplored,
          label: 'Tasks you have opened',
          note: stats.lastActivityAt ? `Last opened ${formatRelativeTime(stats.lastActivityAt)}` : 'Open a task to begin',
        },
      ]
    : []

  return (
    <section aria-label="Catalogue at a glance">
      <dl className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {loading && !stats
          ? Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-2 bg-paper p-4">
                <Skeleton className="h-7 w-10" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))
          : cells.map((cell) => (
              <div key={cell.label} className="flex flex-col bg-paper p-4">
                <dt className="order-2 mt-1 text-[13px] text-stone-deep">{cell.label}</dt>
                <dd className="num-mono order-1 text-[26px] leading-none font-medium text-ink">{cell.value}</dd>
                {cell.note && <dd className="order-3 mt-1 text-[12px] text-stone">{cell.note}</dd>}
              </div>
            ))}
      </dl>
    </section>
  )
}
