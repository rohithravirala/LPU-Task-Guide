import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { CategoryCode } from '../../../components/ui/Tag'
import { ButtonLink } from '../../../components/ui/Button'
import { ErrorState } from '../../../components/ui/StatusMessage'
import { Skeleton } from '../../../components/Loader'
import TaskList from './TaskList'
import { useTasks } from '../hooks/useTasks'

/** Live preview of the catalogue on the landing page (public read-only API). */
export default function CataloguePreview({ categoriesQuery }) {
  const tasksQuery = useTasks({ sort: 'recommended', limit: 4 })
  const categories = categoriesQuery.data ?? []

  return (
    <section id="catalogue" aria-labelledby="catalogue-title" className="border-b border-line">
      <div className="mx-auto max-w-[76rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <SectionHeader
          index="03"
          eyebrow="Task catalogue"
          title={<span id="catalogue-title">Start from what you want to do</span>}
          description="Tasks are grouped the way students think about them, not by which portal they live in."
          action={
            <ButtonLink to="/tasks" variant="secondary" iconRight={ArrowRight}>
              Explore all tasks
            </ButtonLink>
          }
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div>
            <p className="label-mono text-stone-deep">Categories</p>
            {categoriesQuery.error ? (
              <ErrorState compact className="mt-3" error={categoriesQuery.error} onRetry={categoriesQuery.refetch} />
            ) : (
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {categoriesQuery.loading && !categories.length
                  ? Array.from({ length: 6 }, (_, index) => (
                      <li key={index} className="py-3">
                        <Skeleton className="h-5 w-40" />
                      </li>
                    ))
                  : categories.map((category) => (
                      <li key={category._id}>
                        <Link
                          to={`/tasks?category=${category.slug}`}
                          className="group flex items-center gap-3 py-2.5 text-sm text-charcoal hover:text-ink"
                        >
                          <CategoryCode code={category.code} />
                          <span className="flex-1 group-hover:underline group-hover:underline-offset-4">{category.name}</span>
                          <span className="num-mono text-[12px] text-stone-deep">{category.taskCount}</span>
                        </Link>
                      </li>
                    ))}
              </ul>
            )}
          </div>

          <div>
            <p className="label-mono text-stone-deep">Recommended starting points</p>
            <div className="mt-3">
              {tasksQuery.error ? (
                <ErrorState compact error={tasksQuery.error} onRetry={tasksQuery.refetch} />
              ) : (
                <TaskList tasks={tasksQuery.data?.items} loading={tasksQuery.loading} layout="grid" skeletonCount={4} />
              )}
            </div>
            <p className="mt-4 text-[13px] text-stone-deep">
              Sample guidance is marked <span className="font-medium text-ink">Unverified</span> until it has been checked
              against official university sources.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
