import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { getCategories } from '../services/taskService'

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'popular', label: 'Most opened' },
  { value: 'title', label: 'A to Z' },
  { value: 'updated', label: 'Recently updated' },
]

const DEFAULTS = { q: '', category: '', sort: 'recommended', page: 1 }
const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value))

/**
 * Catalogue filters live in the URL (?q=&category=&sort=&page=) so results can be
 * shared, bookmarked and restored with the back button (Task 9).
 */
export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const sort = searchParams.get('sort')
    const page = Number.parseInt(searchParams.get('page') ?? '', 10)
    return {
      q: (searchParams.get('q') ?? '').slice(0, 80),
      category: searchParams.get('category') ?? '',
      sort: SORT_VALUES.has(sort) ? sort : DEFAULTS.sort,
      page: Number.isFinite(page) && page > 0 ? page : DEFAULTS.page,
    }
  }, [searchParams])

  /** Merges a patch into the URL. Changing anything except `page` resets to page 1. */
  const setFilters = useCallback(
    (patch) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(patch)) {
          if (value === '' || value === null || value === undefined || value === DEFAULTS[key]) next.delete(key)
          else next.set(key, String(value))
        }
        if (!('page' in patch)) next.delete('page')
        return next
      })
    },
    [setSearchParams],
  )

  const clearFilters = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams])

  const hasActiveFilters = Boolean(filters.q || filters.category || filters.sort !== DEFAULTS.sort)

  return { filters, setFilters, clearFilters, hasActiveFilters }
}

/** Active categories with task counts (used by filters, forms and the landing page). */
export function useCategories({ includeInactive = false } = {}) {
  return useApiQuery(({ signal }) => getCategories({ includeInactive }, { signal }), [includeInactive])
}
