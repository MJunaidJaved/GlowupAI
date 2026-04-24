const API_BASE = import.meta.env.VITE_API_URL ?? '';

const getToken = () => localStorage.getItem('token')

const apiRequest = async (method, endpoint, body = null) => {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}` 

  const config = { method, headers }
  if (body) config.body = JSON.stringify(body)

  const response = await fetch(`${API_URL}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  get: (endpoint) => apiRequest('GET', endpoint),
  post: (endpoint, body) => apiRequest('POST', endpoint, body),
  put: (endpoint, body) => apiRequest('PUT', endpoint, body),
  delete: (endpoint) => apiRequest('DELETE', endpoint),
}

export const setToken = (token) => localStorage.setItem('token', token)
export const removeToken = () => localStorage.removeItem('token')
export const getStoredToken = () => localStorage.getItem('token')
