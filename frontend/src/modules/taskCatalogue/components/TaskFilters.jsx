import { CategoryIcon } from '../../../components/ui/CategoryIcon'
import { Field, Select } from '../../../components/ui/Field'
import { Skeleton } from '../../../components/Loader'
import { SORT_OPTIONS } from '../hooks/useTaskFilters'

function IndexButton({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex w-full items-center gap-3 rounded-sm py-2 pr-2 pl-3 text-left text-sm transition-colors ${
        active ? 'bg-surface font-semibold text-ink' : 'text-charcoal hover:bg-surface/70 hover:text-ink'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-1.5 left-0 w-[3px] rounded-xs ${active ? 'bg-vermilion' : 'bg-transparent'}`}
      />
      {children}
      {typeof count === 'number' && <span className="num-mono ml-auto text-[12px] text-stone-deep">{count}</span>}
    </button>
  )
}

/**
 * Category index + sort control (Task 9).
 * Desktop: a handbook-style index column. Mobile: two compact selects.
 */
export default function TaskFilters({
  categories,
  loading = false,
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
  showSort = true,
}) {
  const list = categories ?? []
  const total = list.reduce((sum, category) => sum + (category.taskCount ?? 0), 0)

  return (
    <>
      {/* Mobile and tablet */}
      <div className={`grid gap-3 lg:hidden ${showSort ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <Field label="Category" htmlFor="filter-category">
          <Select
            id="filter-category"
            value={activeCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            disabled={loading}
          >
            <option value="">All categories</option>
            {list.map((category) => (
              <option key={category._id} value={category.slug}>
                {category.name} ({category.taskCount})
              </option>
            ))}
          </Select>
        </Field>
        {showSort && (
          <Field label="Sort by" htmlFor="filter-sort-mobile">
            <Select id="filter-sort-mobile" value={sort} onChange={(event) => onSortChange(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      {/* Desktop */}
      <nav aria-label="Task categories" className="hidden lg:block">
        <p className="label-mono text-stone-deep">Index</p>
        <ul className="mt-3 space-y-0.5">
          <li>
            <IndexButton active={!activeCategory} onClick={() => onCategoryChange('')} count={loading ? undefined : total}>
              All tasks
            </IndexButton>
          </li>
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
                <li key={index} className="px-3 py-2.5">
                  <Skeleton className="h-4 w-36" />
                </li>
              ))
            : list.map((category) => (
                <li key={category._id}>
                  <IndexButton
                    active={activeCategory === category.slug}
                    onClick={() => onCategoryChange(category.slug)}
                    count={category.taskCount}
                  >
                    <CategoryIcon name={category.icon} className="size-4 shrink-0 text-stone-deep group-aria-pressed:text-ink" />
                    <span className="truncate">{category.name}</span>
                  </IndexButton>
                </li>
              ))}
        </ul>

        {showSort && (
          <div className="mt-8 border-t border-line pt-6">
            <Field label="Sort by" htmlFor="filter-sort">
              <Select id="filter-sort" value={sort} onChange={(event) => onSortChange(event.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}
      </nav>
    </>
  )
}
