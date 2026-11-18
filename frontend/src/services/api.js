import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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

export function getErrorMessage(error) {
  return error.response?.data?.message || 'Could not reach the server. Is the backend running?'
}

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

const getData = (request) => request.then((response) => response.data.data)

export const login = (registrationNumber, password) => getData(api.post('/auth/login', { registrationNumber, password }))
export const loginAsDemo = () => getData(api.post('/auth/demo'))
export const getTasks = (search = '') => getData(api.get('/tasks', { params: { search } }))
export const getUpdates = () => getData(api.get('/updates'))
export const getJourney = (taskId) => getData(api.get(`/journeys/${taskId}`))
export const getFaqs = ({ search, taskId }) => getData(api.get('/faqs', { params: { search, taskId } }))
export const getServices = () => getData(api.get('/services'))
