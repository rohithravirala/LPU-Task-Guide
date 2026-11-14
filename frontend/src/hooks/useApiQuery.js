import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { isRequestCancelled } from '../services/api'

/**
 * Minimal data-fetching hook shared by every module hook.
 *
 *   const { data, error, loading, refetch } = useApiQuery(
 *     ({ signal }) => getTask(slug, { signal }),
 *     [slug],
 *   )
 *
 * - Re-fetches when `deps` change (compared by value) or when `refetch()` is called.
 * - Aborts the in-flight request when deps change or the component unmounts, so a
 *   slow, stale response can never overwrite a newer one.
 * - `data` belongs to the current deps only; `previousData` keeps the last result
 *   (useful to avoid flicker while new filter results load).
 */
export function useApiQuery(fetcher, deps = [], { enabled = true } = {}) {
  const depsKey = JSON.stringify(deps)
  const [reloadCount, setReloadCount] = useState(0)
  const requestKey = `${depsKey}#${reloadCount}`
  const [state, setState] = useState({ depsKey: null, requestKey: null, data: undefined, error: null })

  const runFetcher = useEffectEvent((signal) => fetcher({ signal }))

  useEffect(() => {
    if (!enabled) return undefined
    const controller = new AbortController()

    runFetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ depsKey, requestKey, data, error: null })
      })
      .catch((error) => {
        if (controller.signal.aborted || isRequestCancelled(error)) return
        setState((previous) => ({
          depsKey,
          requestKey,
          data: previous.depsKey === depsKey ? previous.data : undefined,
          error,
        }))
      })

    return () => controller.abort()
  }, [depsKey, requestKey, enabled])

  const refetch = useCallback(() => setReloadCount((count) => count + 1), [])

  const loading = enabled && state.requestKey !== requestKey
  const current = state.depsKey === depsKey

  return {
    data: current ? state.data : undefined,
    previousData: state.data,
    error: !loading && current ? state.error : null,
    loading,
    refetch,
  }
}
