import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpRight, LoaderCircle, Search, ShieldCheck, X, Zap } from 'lucide-react'
import TaskCard from './TaskCard'
import PortalMark from '../../components/PortalMark'
import TabCard from '../../components/TabCard'
import { addressLabel, categoryIcon, hostOf, openLabel } from '../../lib/portal'
import { getErrorMessage, getTasks } from '../../services/api'

// Search box + portal tabs + all tasks, grouped under their category.
// The search text and the chosen portal live in the page address (?q=fee&portal=ums),
// so the Portals page can link straight to one portal's tasks.
// `isPublic`: the list on /explore, seen without signing in.
// `belowSearch`: shown right under the search box (the dashboard puts "Your updates" there);
// hidden while searching or filtering, so the results come straight after the search box.
export default function TaskList({ isPublic = false, belowSearch = null }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const portalSlug = searchParams.get('portal') ?? 'all'

  const [searchText, setSearchText] = useState(query) // what the student is typing
  // The last answer from the backend, and which search it belongs to
  const [result, setResult] = useState({ query: null, tasks: [], categories: [], portals: [], error: '' })

  // Load tasks when the page opens and every time the search changes
  useEffect(() => {
    let ignore = false // ignore an old answer if a newer search was started
    getTasks(query)
      .then((data) => {
        if (!ignore) setResult({ query, ...data, error: '' })
      })
      .catch((err) => {
        if (!ignore) setResult((previous) => ({ ...previous, query, error: getErrorMessage(err) }))
      })
    return () => {
      ignore = true
    }
  }, [query])

  // Search while typing, after a short pause (no Search button needed)
  useEffect(() => {
    const text = searchText.trim()
    if (text === query) return
    const timer = setTimeout(() => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (text) next.set('q', text)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText, query, setSearchParams])

  function choosePortal(slug) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (slug === 'all') next.delete('portal')
        else next.set('portal', slug)
        return next
      },
      { replace: true },
    )
  }

  function clearSearch() {
    setSearchText('')
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('q')
        return next
      },
      { replace: true },
    )
  }

  const isFirstLoad = result.query === null
  const isSearching = result.query !== query
  const { tasks, categories, portals } = result

  // How many tasks each portal has (for the tab counts)
  const countByPortal = {}
  for (const task of tasks) {
    const slug = task.portal?.slug
    if (slug) countByPortal[slug] = (countByPortal[slug] ?? 0) + 1
  }

  const activePortal = portals.find((portal) => portal.slug === portalSlug)
  const visibleTasks = activePortal ? tasks.filter((task) => task.portal?.slug === portalSlug) : tasks
  const groups = categories
    .map((category) => ({ category, tasks: visibleTasks.filter((task) => task.category === category) }))
    .filter((group) => group.tasks.length > 0)
  const quickLinks = !query && !activePortal ? tasks.filter((task) => task.isPopular && task.openUrl) : []

  if (isFirstLoad && result.error) {
    return (
      <p role="alert" className="rounded-xl bg-danger-wash px-4 py-3 text-danger">
        {result.error}
      </p>
    )
  }

  return (
    <section>
      {/* Quick links: the most used tasks with short names, like "Important Links" on the UMS dashboard */}
      {quickLinks.length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Zap className="size-5 text-flame" aria-hidden="true" /> Quick links
          </h2>
          {/* One row that scrolls sideways on phones, wrapped lines on bigger screens.
              `relative` keeps the hidden screen-reader text inside the scrolling row. */}
          <ul className="no-scrollbar relative -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {quickLinks.map((task) => (
              <li key={task._id} className="shrink-0">
                <a
                  href={task.openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${task.title} (${task.portal.name})`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-white shadow-sm shadow-blue/20 hover:bg-blue-deep"
                >
                  {task.shortTitle ?? task.title}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">: {task.title} on {task.portal.name} (new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Search + portal tabs */}
      <div className={`rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5 ${quickLinks.length ? 'mt-6' : ''}`}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search any task: attendance, hostel leave, CodeTantra test…"
            aria-label="Search tasks"
            className="h-12 w-full rounded-xl border border-line-strong bg-paper pr-11 pl-12 text-base focus:border-flame focus:bg-surface focus:ring-2 focus:ring-flame/20 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {isSearching && !isFirstLoad ? (
            <LoaderCircle className="absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin text-flame" aria-label="Searching" />
          ) : (
            searchText && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-ink"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )
          )}
        </div>

        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by portal">
          <PortalTab label="All portals" count={tasks.length} active={!activePortal} onClick={() => choosePortal('all')} />
          {portals.map((portal) => (
            <PortalTab
              key={portal.slug}
              label={portal.name}
              count={countByPortal[portal.slug] ?? 0}
              active={activePortal?.slug === portal.slug}
              onClick={() => choosePortal(portal.slug)}
            />
          ))}
        </div>
      </div>

      {/* The chosen portal, with a button to open it */}
      {activePortal && <PortalBanner portal={activePortal} />}

      {belowSearch && !query && !activePortal && <div className="mt-10">{belowSearch}</div>}

      {result.error && !isFirstLoad && (
        <p role="alert" className="mt-6 rounded-xl bg-danger-wash px-4 py-3 text-danger">
          {result.error}
        </p>
      )}

      {query && !isSearching && (
        <p className="mt-6 text-muted" aria-live="polite">
          {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'} found for “{query}” ·{' '}
          <button type="button" onClick={clearSearch} className="font-semibold text-flame-deep underline underline-offset-4">
            Show all tasks
          </button>
        </p>
      )}

      {isFirstLoad && <LoadingCards />}

      {!isFirstLoad && groups.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong bg-surface p-6">
          <p className="font-semibold text-ink">
            No task found{query ? ` for “${query}”` : ''}
            {activePortal ? ` on ${activePortal.name}` : ''}.
          </p>
          <p className="mt-1 text-muted">Try a simpler word, like “fee”, “exam” or “hostel”, or choose All portals.</p>
        </div>
      )}

      <div className={`mt-10 space-y-10 transition-opacity ${isSearching && !isFirstLoad ? 'opacity-60' : ''}`}>
        {groups.map((group) => (
          <TabCard key={group.category} title={group.category} icon={categoryIcon(group.category)} count={group.tasks.length}>
            {/* Each section scrolls on its own, so a long category does not make the page long */}
            <ul className="scroll-area max-h-80 divide-y divide-line overflow-y-auto overscroll-contain rounded-b-2xl">
              {group.tasks.map((task) => (
                <TaskCard key={task._id} task={task} isPublic={isPublic} />
              ))}
            </ul>
          </TabCard>
        ))}
      </div>
    </section>
  )
}

// One portal tab: orange when chosen, white otherwise
function PortalTab({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active ? 'border-flame bg-flame text-white' : 'border-line-strong bg-surface text-charcoal hover:border-flame/60 hover:text-flame-deep'
      }`}
    >
      {label}
      <span className={`rounded-full px-2 text-xs ${active ? 'bg-white/25' : 'bg-paper text-muted'}`}>{count}</span>
    </button>
  )
}

// Dark banner (LPU Live colours) for the chosen portal
function PortalBanner({ portal }) {
  return (
    <div className="mt-8 flex flex-col gap-5 rounded-2xl bg-navy p-5 sm:flex-row sm:items-center sm:p-6">
      <PortalMark portal={portal} size="lg" />
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-bold text-white">{portal.name}</h2>
        <p className="mt-1 text-fog">{portal.description}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-fog">
          <ShieldCheck className="size-4 text-apricot" aria-hidden="true" />
          {addressLabel(portal)} <span className="font-semibold text-white">{hostOf(portal.url)}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <a
          href={portal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-flame px-5 font-semibold text-white hover:bg-flame-deep"
        >
          {openLabel(portal)} <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
        {portal.alternateUrl && (
          <a href={portal.alternateUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-apricot hover:underline">
            {portal.alternateLabel} ↗
          </a>
        )}
      </div>
    </div>
  )
}

// Grey placeholder cards while the first answer is loading
function LoadingCards() {
  return (
    <div className="mt-12 space-y-12" aria-label="Loading tasks">
      {[0, 1].map((card) => (
        <div key={card} className="animate-pulse rounded-2xl border border-line bg-surface p-5">
          <div className="-mt-9 h-8 w-48 rounded-xl bg-flame/30" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="mt-5 flex items-center gap-4">
              <div className="size-11 rounded-xl bg-paper" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-paper" />
                <div className="h-3 w-2/3 rounded bg-paper" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
