import { apiRequest } from './api'

// 401 is an expected answer for these calls, so they never trigger the global sign-out.
export async function getCurrentUser({ signal } = {}) {
  const { data } = await apiRequest('get', '/auth/me', { signal, skipAuthRedirect: true })
  return data
}

export async function login(credentials) {
  const { data } = await apiRequest('post', '/auth/login', { data: credentials, skipAuthRedirect: true })
  return data
}

export async function register(details) {
  const { data } = await apiRequest('post', '/auth/register', { data: details, skipAuthRedirect: true })
  return data
}

export async function logout() {
  await apiRequest('post', '/auth/logout', { skipAuthRedirect: true })
}
