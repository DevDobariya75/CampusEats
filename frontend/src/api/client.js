const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const ACCESS_TOKEN_KEY = 'cognitoAccessToken'
const ID_TOKEN_KEY = 'cognitoIdToken'

const isObject = (value) => value !== null && typeof value === 'object'

const normalizePayload = (payload) => {
  if (isObject(payload) && 'data' in payload) {
    return payload.data
  }

  return payload
}

export async function request(path, options = {}) {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ID_TOKEN_KEY)
  const config = {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  }

  if (options.body instanceof FormData) {
    config.body = options.body
  } else if (options.body !== undefined) {
    config.headers['Content-Type'] = 'application/json'
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config)
  const raw = await response.text()
  const payload = raw ? JSON.parse(raw) : {}

  if (!response.ok || payload.success === false) {
    const message = payload.message || 'Request failed'
    throw new Error(message)
  }

  return {
    message: payload.message,
    data: normalizePayload(payload),
  }
}
