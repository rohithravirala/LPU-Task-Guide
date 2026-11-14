import { Link, Navigate, useLocation } from 'react-router-dom'
import { Info } from 'lucide-react'
import Brand from '../components/Brand'
import TaskList from '../modules/taskCatalogue/TaskList'
import { isLoggedIn } from '../services/api'

// PUBLIC page: every task from every portal, without signing in.
// Open buttons work for everyone; the step-by-step guides ask to sign in first.
export default function Explore() {
  const { search } = useLocation()

  // Signed-in students already have this list on their dashboard
  if (isLoggedIn()) return <Navigate to={`/${search}`} replace />

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 md:h-[72px] lg:px-10">
          <Brand to="/explore" />
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="inline-flex h-10 items-center rounded-lg bg-flame px-4 text-sm font-semibold text-white hover:bg-flame-deep">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
        <h1 className="text-3xl font-bold sm:text-[40px]">Every LPU task, in one place</h1>
        <p className="mt-3 max-w-3xl text-lg text-muted">
          All tasks from UMS, LPU Live, CodeTantra, NeoColab and LPU Touch. No sign-in needed to look around:
          <span className="font-semibold text-charcoal"> Open</span> takes you to the right portal.
        </p>
        <p className="mt-4 flex max-w-3xl items-start gap-2 rounded-xl border border-blue/20 bg-blue-wash px-4 py-3 text-sm text-blue-deep">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Sign in to follow the step-by-step guides, tick off steps and read the FAQs for each task.{' '}
            <Link to="/login" className="font-semibold underline underline-offset-4">Sign in</Link>
          </span>
        </p>
        <div className="mt-8">
          <TaskList isPublic />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted sm:px-6 lg:px-10">
        LPU Task Guide is a student guidance project, not an official LPU website. Every task opens on the official portal.
      </footer>
    </div>
  )
}
