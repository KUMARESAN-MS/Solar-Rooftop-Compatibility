/**
 * API client for the Solar Rooftop Prediction backend.
 * All API calls go through this module — no raw fetch() scattered in components.
 */

import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Interceptor: attach JWT token if available ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('solar_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Interceptor: handle auth errors ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('solar_token')
      // Optionally redirect to login
    }
    return Promise.reject(error)
  }
)

// --- Health check ---
export const checkHealth = () => axios.get('/health')

// --- Solar data (Phase 1) ---
export const fetchSolarData = (latitude, longitude) =>
  api.post('/solar-data', { latitude, longitude })

// --- Full analysis (Phase 2) ---
export const runAnalysis = (propertyData) =>
  api.post('/analyze', propertyData)

// --- Auth (Phase 4) ---
export const register = (email, password, name) =>
  api.post('/auth/register', { email, password, name })

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

// --- Properties (Phase 4) ---
export const getProperties = () => api.get('/properties')
export const saveProperty = (data) => api.post('/properties', data)
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data)
export const deleteProperty = (id) => api.delete(`/properties/${id}`)

export default api
