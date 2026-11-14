import { ArrowLeft, ArrowRight, SearchX, X } from 'lucide-react'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { PageHeader } from '../../../components/ui/SectionHeader'
import { Button } from '../../../components/ui/Button'
import { CategoryCode } from '../../../components/ui/Tag'
import { CategoryIcon } from '../../../components/ui/CategoryIcon'
import { EmptyState, ErrorState } from '../../../components/ui/StatusMessage'
import Loader from '../../../components/Loader'
import TaskSearch from '../components/TaskSearch'
import TaskFilters from '../components/TaskFilters'
import TaskList from '../components/TaskList'
import { useCategories, useTaskFilters } from '../hooks/useTaskFilters'
import { MIN_QUERY_LENGTH, useTaskSearch } from '../hooks/useTaskSearch'
import { useTasks } from '../hooks/useTasks'

function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4">
      <p className="num-mono text-[13px] text-stone-deep">
        Page {meta.page} of {meta.totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" icon={ArrowLeft} disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          iconRight={ArrowRight}
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}

/** Default view: every task, grouped under its category like a handbook index. */
function CatalogueIndex({ categories, tasks, loading, onOpenCategory }) {
  if (loading && !tasks) return <TaskList loading skeletonCount={6} />

  const groups = categories
    .map((category) => ({ category, tasks: (tasks ?? []).filter((task) => task.categoryId === category._id) }))
    .filter((group) => group.tasks.length > 0)

  if (!groups.length) {
    return (
      <EmptyState
        icon={SearchX}
        title="The catalogue is empty"
        description="No tasks have been published yet. Administrators can add tasks from Manage tasks."
      />
    )
  }

  return (
    <div className="space-y-12">
      {groups.map(({ category, tasks: groupTasks }) => (
        <section key={category._id} aria-labelledby={`group-${category.slug}`}>
          <div className="flex flex-wrap items-end justify-between gap-3 pb-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 items-center justify-center rounded-sm bg-ink text-paper">
                <CategoryIcon name={category.icon} className="size-4.5" />
              </span>
              <div>
                <h2 id={`group-${category.slug}`} className="flex items-center gap-2 text-lg font-semibold">
                  {category.name}
                  <CategoryCode code={category.code} />
                </h2>
                {category.description && <p className="text-sm text-stone-deep">{category.description}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenCategory(category.slug)}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-ink hover:underline"
            >
              Only {category.name.toLowerCase()} <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <TaskList tasks={groupTasks} showCategoryLabel={false} />
        </section>
      ))}
    </div>
  )
}

function SearchResults({ search, filters, activeCategory, onClearQuery, onClearCategory }) {
  const result = search.data ?? (search.loading ? search.previousData : undefined)
  const busy = search.loading || search.isTyping

  if (search.error) return <ErrorState error={search.error} onRetry={search.refetch} />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3" aria-live="polite">
        <p className="text-sm text-charcoal">
          {busy && !result ? (
            <Loader label="Searching" />
          ) : (
            <>
              <span className="num-mono font-semibold text-ink">{result?.total ?? 0}</span>{' '}
              {result?.total === 1 ? 'task matches' : 'tasks match'} <strong className="text-ink">“{filters.q}”</strong>
              {activeCategory && (
                <>
                  {' '}in <strong className="text-ink">{activeCategory.name}</strong>
                </>
              )}
            </>
          )}
        </p>
        <div className="flex gap-2">
          {activeCategory && (
            <Button variant="ghost" size="sm" icon={X} onClick={onClearCategory}>
              All categories
            </Button>
          )}
          <Button variant="ghost" size="sm" icon={X} onClick={onClearQuery}>
            Clear search
          </Button>
        </div>
      </div>

      {result?.relatedTerms?.length > 0 && result.total > 0 && (
        <p className="mt-3 text-[13px] text-stone-deep">
          Also matched related terms: <span className="text-ink">{result.relatedTerms.slice(0, 6).join(', ')}</span>
        </p>
      )}

      <div className="mt-4">
        <TaskList
          tasks={result?.items}
          loading={busy}
          highlight={filters.q.toLowerCase().split(/\s+/)}
          emptyState={
            <EmptyState
              icon={SearchX}
              title={`No tasks match “${filters.q}”`}
              description={
                activeCategory
                  ? `Nothing in ${activeCategory.name} matches. Try all categories, or use a simpler word.`
                  : 'Try a simpler or different word, for example “fees”, “exam” or “certificate”, or browse the categories.'
              }
              action={
                <Button variant="secondary" size="sm" onClick={activeCategory ? onClearCategory : onClearQuery}>
                  {activeCategory ? 'Search all categories' : 'Browse all tasks'}
                </Button>
              }
            />
          }
        />
      </div>
    </div>
  )
}

export default function TaskCatalogue() {
  const { filters, setFilters } = useTaskFilters()
  const categoriesQuery = useCategories()
  const categories = categoriesQuery.data ?? []
  const activeCategory = categories.find((category) => category.slug === filters.category)
  const searching = filters.q.trim().length >= MIN_QUERY_LENGTH

  useDocumentTitle(searching ? `Results for “${filters.q}”` : activeCategory?.name ?? 'Task catalogue')

  const search = useTaskSearch(searching ? filters.q : '', {
    category: filters.category || undefined,
    limit: 50,
    debounce: 0,
  })
  const browse = useTasks({
    category: filters.category || undefined,
    sort: filters.sort,
    page: filters.category ? filters.page : 1,
    limit: filters.category ? 20 : 100,
    enabled: !searching,
  })
  const browseItems = browse.data?.items ?? (browse.loading ? browse.previousData?.items : undefined)

  const title = searching ? 'Search results' : activeCategory ? activeCategory.name : 'Every task, one index'
  const description = searching
    ? 'Ranked by how closely each task matches what you typed.'
    : activeCategory
      ? activeCategory.description
      : 'Search in your own words or browse by category. Every task opens as a guided, step-by-step journey.'

  return (
    <div>
      <PageHeader eyebrow="Task catalogue" title={title} description={description}>
        <div className="mt-6 max-w-3xl">
          <TaskSearch key={filters.q} initialQuery={filters.q} />
        </div>
      </PageHeader>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <TaskFilters
            categories={categories}
            loading={categoriesQuery.loading && !categories.length}
            activeCategory={filters.category}
            onCategoryChange={(slug) => setFilters({ category: slug })}
            sort={filters.sort}
            onSortChange={(sort) => setFilters({ sort })}
            showSort={!searching}
          />
          {categoriesQuery.error && (
            <ErrorState compact className="mt-4" error={categoriesQuery.error} onRetry={categoriesQuery.refetch} />
          )}
        </aside>

        <section aria-label="Tasks" className="min-w-0">
          {searching ? (
            <SearchResults
              search={search}
              filters={filters}
              activeCategory={activeCategory}
              onClearQuery={() => setFilters({ q: '' })}
              onClearCategory={() => setFilters({ category: '' })}
            />
          ) : browse.error ? (
            <ErrorState error={browse.error} onRetry={browse.refetch} />
          ) : filters.category ? (
            <>
              <p className="border-b border-line pb-3 text-sm text-stone-deep" aria-live="polite">
                <span className="num-mono font-semibold text-ink">{browse.data?.meta.total ?? '—'}</span> tasks in this category
              </p>
              <div className="mt-4">
                <TaskList
                  tasks={browseItems}
                  loading={browse.loading}
                  emptyState={
                    <EmptyState
                      icon={SearchX}
                      title="No tasks in this category yet"
                      action={
                        <Button variant="secondary" size="sm" onClick={() => setFilters({ category: '' })}>
                          See all tasks
                        </Button>
                      }
                    />
                  }
                />
              </div>
              <Pagination meta={browse.data?.meta} onPageChange={(page) => setFilters({ page })} />
            </>
          ) : (
            <CatalogueIndex
              categories={categories}
              tasks={browseItems}
              loading={browse.loading || categoriesQuery.loading}
              onOpenCategory={(slug) => setFilters({ category: slug })}
            />
          )}
        </section>
      </div>
    </div>
  )
}
