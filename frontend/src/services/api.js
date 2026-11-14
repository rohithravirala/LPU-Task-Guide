import axios from 'axios'

// Every call to the backend goes through this one axios instance.
// VITE_API_URL comes from frontend/.env (e.g. http://localhost:3000/api).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// Before every request: attach the login token, so the backend knows who is asking.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// After every response: if the backend says 401 (token missing/expired), log out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/')
    if (error.response?.status === 401 && !isAuthRequest) {
      logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Turns any axios error into a message we can show on screen.
export function getErrorMessage(error) {
  return error.response?.data?.message || 'Could not reach the server. Is the backend running?'
}

/* ---------- Login session (stored in the browser) ---------- */

export function saveSession({ token, student }) {
  localStorage.setItem('token', token)
  localStorage.setItem('student', JSON.stringify(student))
}

export function getStudent() {
  try {
    return JSON.parse(localStorage.getItem('student'))
  } catch {
    return null
  }
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem('token'))
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('student')
}

/* ---------- API calls (each returns the `data` part of the response) ---------- */


export async function login(registrationNumber, password) {
  const response = await api.post('/auth/login', { registrationNumber, password })
  return response.data.data // { token, student }
}

// Module 1 – Task Catalogue (public: works without logging in)
export async function getTasks(search = '') {
  const response = await api.get('/tasks', { params: { search } })
  return response.data.data // { tasks, categories, portals }
}

// Module 1 – "Your updates" (sample data: LPU has no public API)
export async function getUpdates() {
  const response = await api.get('/updates')
  return response.data.data // { updates }
}

// Module 2 – Task Journey Engine
export async function getJourney(taskId) {
  const response = await api.get(`/journeys/${taskId}`)
  return response.data.data // { task, steps }
}

// Module 3 – Student Guidance and Help
export async function getFaqs({ search = '', taskId = '' } = {}) {
  const response = await api.get('/faqs', { params: { search, taskId } })
  return response.data.data
}

export async function getServices() {
  const response = await api.get('/services')
  return response.data.data
}
