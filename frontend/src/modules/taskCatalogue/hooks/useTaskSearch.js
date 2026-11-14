import { useApiQuery } from '../../../hooks/useApiQuery'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { searchTasks } from '../services/taskService'

export const MIN_QUERY_LENGTH = 2

/**
 * Ranked task search (Task 8). Debounced so typing does not fire a request per key.
 * Queries shorter than MIN_QUERY_LENGTH do not hit the API.
 */
export function useTaskSearch(query, { category, limit = 20, debounce = 250 } = {}) {
  const trimmed = (query ?? '').trim()
  const debounced = useDebouncedValue(trimmed, debounce)
  const enabled = debounced.length >= MIN_QUERY_LENGTH

  const result = useApiQuery(
    ({ signal }) => searchTasks({ q: debounced, category, limit }, { signal }),
    [debounced, category, limit],
    { enabled },
  )

  return {
    ...result,
    query: debounced,
    enabled,
    isTyping: trimmed !== debounced,
  }
}
