import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { ErrorState } from '../../../components/ui/StatusMessage'
import DashboardHeader from '../components/DashboardHeader'
import RecentTasks from '../components/RecentTasks'
import PopularTasks from '../components/PopularTasks'
import TaskStatistics from '../components/TaskStatistics'
import TaskList from '../components/TaskList'
import { getDashboardSummary } from '../services/taskService'

/**
 * Student dashboard: actions first (search, continue, quick access), numbers last.
 * Module 2 Part 2 adds "Continue your journeys" and Module 3 adds notices and help
 * into the marked slots below.
 */
export default function Dashboard() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const summary = useApiQuery(({ signal }) => getDashboardSummary({ signal }), [])
  const featured = summary.data?.featured ?? []

  return (
    <div className="space-y-12">
      <DashboardHeader name={user?.name} />

      {/* Slot: Module 2 Part 2 — active journeys with "Continue journey" */}

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
        <RecentTasks index="01" />
        <PopularTasks index="02" />
      </div>

      {(summary.loading || featured.length > 0) && (
        <section aria-labelledby="featured-title">
          <SectionHeader
            index="03"
            eyebrow="Recommended"
            title={<span id="featured-title">Good places to start</span>}
            description="Tasks the platform team recommends for most students."
            action={
              <Link to="/tasks" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:underline">
                Full catalogue <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-5">
            <TaskList tasks={featured} loading={summary.loading} layout="grid" skeletonCount={4} />
          </div>
        </section>
      )}

      {/* Slot: Module 3 — important notices and "Need help?" */}

      <section aria-labelledby="glance-title">
        <SectionHeader index="04" eyebrow="At a glance" title={<span id="glance-title">The catalogue and you</span>} />
        <div className="mt-5">
          {summary.error ? (
            <ErrorState compact error={summary.error} onRetry={summary.refetch} />
          ) : (
            <TaskStatistics stats={summary.data?.stats} loading={summary.loading} />
          )}
        </div>
      </section>
    </div>
  )
}
