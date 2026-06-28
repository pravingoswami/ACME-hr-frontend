import type { ApiResponse } from '../types/api'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'

export class ApiClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(refreshToken: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function clearSession() {
  clearToken()
  clearRefreshToken()
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const payload = (await response.json()) as ApiResponse<T>

  if (!response.ok || !payload.success) {
    const message =
      payload.success === false ? payload.error : 'Request failed'
    throw new ApiClientError(message, response.status)
  }

  return payload.data
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers()
  const token = getToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const payload = (await response.json()) as ApiResponse<T>

  if (!response.ok || !payload.success) {
    const message =
      payload.success === false ? payload.error : 'Request failed'
    throw new ApiClientError(message, response.status)
  }

  return payload.data
}

async function downloadBlobResponse(response: Response, fileName: string) {
  if (!response.ok) {
    let message = 'Download failed'

    try {
      const payload = (await response.json()) as ApiResponse<unknown>
      if (payload.success === false) {
        message = payload.error
      }
    } catch {
      // response body is not JSON
    }

    throw new ApiClientError(message, response.status)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function apiDownload(path: string, fileName: string) {
  const headers = new Headers()
  const token = getToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { headers })
  await downloadBlobResponse(response, fileName)
}

export async function apiDownloadPost(path: string, body: unknown, fileName: string) {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const token = getToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  await downloadBlobResponse(response, fileName)
}
