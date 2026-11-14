import { useApiQuery } from '../../../hooks/useApiQuery'
import { getPopularTasks } from '../services/taskService'

/** Tasks opened by the most distinct students (Task 10). */
export function usePopularTasks(limit = 5) {
  return useApiQuery(({ signal }) => getPopularTasks(limit, { signal }), [limit])
}
