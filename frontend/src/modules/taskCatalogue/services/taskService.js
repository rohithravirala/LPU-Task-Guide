import { apiRequest, cleanParams } from '../../../services/api'

/* Reads ------------------------------------------------------------------ */

/** @returns {Promise<{ items: object[], meta: { page, limit, total, totalPages } }>} */
export async function getTasks(params = {}, { signal } = {}) {
  const { data, meta } = await apiRequest('get', '/tasks', { params: cleanParams(params), signal })
  return { items: data, meta }
}

/** @returns {Promise<{ task, steps, services, summary, related }>} */
export async function getTask(idOrSlug, { signal } = {}) {
  const { data } = await apiRequest('get', `/tasks/${encodeURIComponent(idOrSlug)}`, { signal })
  return data
}

/** @returns {Promise<{ items, total, query, relatedTerms, matchedCategories }>} */
export async function searchTasks({ q, category, limit } = {}, { signal } = {}) {
  const { data } = await apiRequest('get', '/tasks/search', { params: cleanParams({ q, category, limit }), signal })
  return data
}

export async function getPopularTasks(limit = 5, { signal } = {}) {
  const { data } = await apiRequest('get', '/tasks/popular', { params: { limit }, signal })
  return data
}

/** Current student's recently opened tasks: [{ task, lastViewedAt, viewCount }] */
export async function getRecentTasks(limit = 5, { signal } = {}) {
  const { data } = await apiRequest('get', '/tasks/recent', { params: { limit }, signal })
  return data
}

export async function getCategories({ includeInactive } = {}, { signal } = {}) {
  const { data } = await apiRequest('get', '/categories', { params: cleanParams({ includeInactive }), signal })
  return data
}

/** @returns {Promise<{ stats, featured }>} */
export async function getDashboardSummary({ signal } = {}) {
  const { data } = await apiRequest('get', '/dashboard', { signal })
  return data
}

/* Admin writes ----------------------------------------------------------- */

export async function createTask(payload) {
  const { data } = await apiRequest('post', '/tasks', { data: payload })
  return data
}

export async function updateTask(id, payload) {
  const { data } = await apiRequest('put', `/tasks/${encodeURIComponent(id)}`, { data: payload })
  return data
}

export async function deleteTask(id) {
  const { data } = await apiRequest('delete', `/tasks/${encodeURIComponent(id)}`)
  return data
}
