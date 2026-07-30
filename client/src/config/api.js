const defaultProductionApiBaseUrl = 'https://academy-management-system-czfq.onrender.com/api/v1'
const localApiBaseUrl = 'http://localhost:3000/api/v1'

function getApiBaseUrl() {
  let url = import.meta.env.VITE_API_BASE_URL

  if (!url && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    url = defaultProductionApiBaseUrl
  }

  if (!url) {
    url = localApiBaseUrl
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, '')

  // Ensure /api/v1 suffix is attached
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`
  }

  return url
}

export const API_BASE_URL = getApiBaseUrl()
