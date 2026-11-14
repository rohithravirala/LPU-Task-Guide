import { apiRequest } from '../../../services/api'

/**
 * Journey progress persistence: the integration point with Module 2 Part 2.
 *
 *  - 'device'  (default): saved in this browser's localStorage, per user and task.
 *  - 'account': saved through the Progress API owned by Module 2 Part 2, using the
 *               shared contract in docs/api-and-routes.md. Enable it with
 *               VITE_PROGRESS_API_ENABLED=true once those endpoints exist.
 *
 * Both modes expose the same functions, so the journey UI does not change.
 * Progress only records the student's own checklist. It never claims that a
 * university transaction happened.
 */
export const progressStorage = import.meta.env.VITE_PROGRESS_API_ENABLED === 'true' ? 'account' : 'device'

const EMPTY = { progressId: null, completedStepIds: [], updatedAt: null }
const storageKey = (userId, taskId) => `lpu-uni-path:journey:${userId}:${taskId}`

function readDevice(userId, taskId) {
  try {
    const raw = window.localStorage.getItem(storageKey(userId, taskId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.completedStepIds)) return null
    return { progressId: null, completedStepIds: parsed.completedStepIds.map(String), updatedAt: parsed.updatedAt ?? null }
  } catch {
    return null // storage blocked (private mode) or corrupted value
  }
}

/** @returns {Promise<{ progressId: string|null, completedStepIds: string[], updatedAt: string|null }>} */
export async function loadProgress({ userId, taskId, signal }) {
  if (progressStorage === 'account') {
    const { data } = await apiRequest('get', `/progress/${encodeURIComponent(taskId)}`, { signal })
    if (!data) return EMPTY
    return {
      progressId: data._id,
      completedStepIds: (data.completedSteps ?? []).map((step) => String(step?._id ?? step)),
      updatedAt: data.lastAccessedAt ?? null,
    }
  }
  return readDevice(userId, taskId) ?? EMPTY
}

/**
 * Saves the full set of completed steps. In account mode the Progress record is
 * created on the first save (POST), then updated (PATCH).
 * @returns {Promise<{ progressId: string|null }>}
 */
export async function saveProgress({ userId, taskId, progressId, completedStepIds, currentStepId }) {
  if (progressStorage === 'account') {
    let id = progressId
    if (!id) {
      const { data } = await apiRequest('post', '/progress', { data: { taskId } })
      id = data._id
    }
    await apiRequest('patch', `/progress/${encodeURIComponent(id)}`, {
      data: { completedSteps: completedStepIds, currentStepId },
    })
    return { progressId: id }
  }

  // Throws when storage is unavailable; the journey shows "Not saved" with a retry.
  window.localStorage.setItem(
    storageKey(userId, taskId),
    JSON.stringify({ completedStepIds, currentStepId, updatedAt: new Date().toISOString() }),
  )
  return { progressId: null }
}

/** Synchronous read used to label "Resume journey". Returns null in account mode. */
export function peekProgress({ userId, taskId }) {
  if (progressStorage !== 'device' || !userId || !taskId) return null
  return readDevice(userId, taskId)
}
