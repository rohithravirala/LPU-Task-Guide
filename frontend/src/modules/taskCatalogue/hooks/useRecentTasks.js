import { useAuth } from '../../../context/AuthContext'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { getRecentTasks } from '../services/taskService'

/**
 * The signed-in student's recently opened tasks (Task 11). The API scopes this to
 * the session cookie; the hook only re-fetches when the signed-in user changes.
 */
export function useRecentTasks(limit = 5) {
  const { user } = useAuth()
  return useApiQuery(({ signal }) => getRecentTasks(limit, { signal }), [user?._id, limit], {
    enabled: Boolean(user),
  })
}
