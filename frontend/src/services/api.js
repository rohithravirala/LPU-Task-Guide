import axios from 'axios'

/**
 * Single axios instance for the whole app.
 * - Sends the httpOnly auth cookie (withCredentials) to the separate API origin.
 * - Normalises every failure into an ApiRequestError with a readable message,
 *   the HTTP status and any field errors returned by the API.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

export class ApiRequestError extends Error {
  constructor({ message, status = 0, errors = null }) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.errors = errors
  }

  get isNotFound() {
    return this.status === 404
  }

  get isNetworkError() {
    return this.status === 0
  }
}

let unauthorizedHandler = null

/** AuthContext registers here so an expired session signs the user out everywhere. */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null
  }
}

function toApiRequestError(error) {
  const status = error.response?.status ?? 0
  const body = error.response?.data
  let message = body?.message
  if (!message) {
    message =
      status === 0
        ? 'We could not reach the server. Check your connection and that the API is running.'
        : 'Something went wrong. Please try again.'
  }
  return new ApiRequestError({ message, status, errors: body?.errors ?? null })
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)
    const normalised = toApiRequestError(error)
    if (normalised.status === 401 && !error.config?.skipAuthRedirect) {
      unauthorizedHandler?.(normalised)
    }
    return Promise.reject(normalised)
  },
)

/**
 * Calls the API and returns the response envelope: { success, message, data, meta? }.
 * Pass `skipAuthRedirect` for calls where a 401 is an expected answer (login, /auth/me).
 */
export async function apiRequest(method, url, { data, params, signal, skipAuthRedirect } = {}) {
  const response = await api.request({ method, url, data, params, signal, skipAuthRedirect })
  return response.data
}

export function isRequestCancelled(error) {
  return axios.isCancel(error)
}

/** Removes empty values so they are not sent as query parameters. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

export default api
