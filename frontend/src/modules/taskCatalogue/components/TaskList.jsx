import { Skeleton } from '../../../components/Loader'
import TaskCard from './TaskCard'

function RowSkeleton() {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-4 px-1 py-5 sm:px-4">
      <Skeleton className="h-6 w-11" />
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-3 w-48" />
      </div>
    </li>
  )
}

function TileSkeleton() {
  return (
    <li className="space-y-3 bg-surface p-5">
      <Skeleton className="h-6 w-11" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-24" />
    </li>
  )
}

/**
 * Task Index: tasks as hairline-separated index rows ("index") or a ruled grid of
 * tiles ("grid"). Handles its own loading skeleton and empty state.
 */
export default function TaskList({
  tasks,
  loading = false,
  layout = 'index',
  highlight,
  emptyState = null,
  skeletonCount = 4,
  ranked = false,
  getExtraMeta,
  showCategoryLabel = true,
  className = '',
}) {
  const items = tasks ?? []
  const isGrid = layout === 'grid'
  const listClass = isGrid
    ? `grid gap-px border border-line bg-line sm:grid-cols-2 ${className}`
    : `divide-y divide-line border-y border-line ${className}`

  if (loading && items.length === 0) {
    return (
      <ul className={listClass} aria-busy="true" aria-label="Loading tasks">
        {Array.from({ length: skeletonCount }, (_, index) =>
          isGrid ? <TileSkeleton key={index} /> : <RowSkeleton key={index} />,
        )}
      </ul>
    )
  }

  if (items.length === 0) return emptyState

  return (
    <ul className={`${listClass} ${loading ? 'opacity-60 transition-opacity' : ''}`} aria-busy={loading || undefined}>
      {items.map((task, index) => (
        <li key={task._id} className={isGrid ? 'bg-surface' : undefined}>
          <TaskCard
            task={task}
            variant={isGrid ? 'tile' : 'row'}
            highlight={highlight}
            rank={ranked ? index + 1 : undefined}
            extraMeta={getExtraMeta?.(task)}
            showCategoryLabel={showCategoryLabel}
          />
        </li>
      ))}
    </ul>
  )
}
