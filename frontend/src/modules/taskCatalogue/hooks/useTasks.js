import { useApiQuery } from '../../../hooks/useApiQuery'
import { getTask, getTasks } from '../services/taskService'

/** Paginated task list (Task 5). */
export function useTasks({ category, sort, page, limit, featured, includeInactive, enabled = true } = {}) {
  return useApiQuery(
    ({ signal }) => getTasks({ category, sort, page, limit, featured, includeInactive }, { signal }),
    [category, sort, page, limit, featured, includeInactive],
    { enabled },
  )
}

/** One task with its step outline, services and related tasks (Task 7). */
export function useTask(idOrSlug) {
  return useApiQuery(({ signal }) => getTask(idOrSlug, { signal }), [idOrSlug], { enabled: Boolean(idOrSlug) })
}
