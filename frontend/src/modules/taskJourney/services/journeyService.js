import { apiRequest, cleanParams } from '../../../services/api'

/** Task + ordered steps (service populated) + services involved (Tasks 16, 17). */
export async function getJourney(taskRef, { signal } = {}) {
  const { data } = await apiRequest('get', `/journeys/${encodeURIComponent(taskRef)}`, { signal })
  return data
}

/** University services, e.g. for admin step mapping (Task 15). */
export async function getServices({ includeInactive } = {}, { signal } = {}) {
  const { data } = await apiRequest('get', '/services', { params: cleanParams({ includeInactive }), signal })
  return data
}

/** One service plus the tasks that rely on it (Task 21). */
export async function getService(id, { signal } = {}) {
  const { data } = await apiRequest('get', `/services/${encodeURIComponent(id)}`, { signal })
  return data
}
