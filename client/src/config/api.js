const defaultProductionApiBaseUrl = 'https://academy-management-system-czfq.onrender.com/api/v1'
const localApiBaseUrl = 'http://localhost:3000/api/v1'

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return defaultProductionApiBaseUrl
  }
  return localApiBaseUrl
}

export const API_BASE_URL = getApiBaseUrl()
