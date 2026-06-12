/**
 * Axios instance + auth-aware interceptors used by every service.
 *
 *  - Reads the access token from the auth store (in-memory) and adds the
 *    `Authorization: Bearer <token>` header on every request.
 *  - On 401, attempts a single refresh via /api/auth/refresh using the
 *    refresh token from localStorage. If that also fails, clears the
 *    store and redirects to /sign-in.
 *  - All errors are normalized to an `ApiError` instance with `message`
 *    and optional `status` for ergonomic `try/catch` in services.
 */
import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { getCookie, removeCookie, setCookie } from './cookies'

const ACCESS_COOKIE = 'kiosk_access_token'
const REFRESH_COOKIE = 'kiosk_refresh_token'
const USER_KEY = 'kiosk_user_data'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
  avatar: string | null
}

export const ACCESS_TOKEN_KEY = ACCESS_COOKIE
export const REFRESH_TOKEN_KEY = REFRESH_COOKIE

export function getAccessToken(): string | null {
  const v = getCookie(ACCESS_COOKIE)
  if (!v) return null
  try {
    return JSON.parse(v)
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  const v = getCookie(REFRESH_COOKIE)
  if (!v) return null
  try {
    return JSON.parse(v)
  } catch {
    return null
  }
}

export function setTokens(access: string, refresh: string) {
  setCookie(ACCESS_COOKIE, JSON.stringify(access), 60 * 60) // 1h — server refresh kicks in
  setCookie(REFRESH_COOKIE, JSON.stringify(refresh), 60 * 60 * 24 * 7)
}

export function clearTokens() {
  removeCookie(ACCESS_COOKIE)
  removeCookie(REFRESH_COOKIE)
  localStorage.removeItem(USER_KEY)
}

// ---------------------------------------------------------------------------
//  Shared types
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const DEFAULT_PAGE_SIZE = 20

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
//  Axios instance
// ---------------------------------------------------------------------------
const baseURL = (import.meta as ImportMeta).env?.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((cfg) => {
  const token = getAccessToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

apiClient.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean }
    if (err.response?.status === 401 && !original?._retry) {
      const refresh = getRefreshToken()
      if (!refresh) {
        clearTokens()
        redirectToSignIn()
        return Promise.reject(normalizeError(err))
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (!newToken) {
              reject(normalizeError(err))
              return
            }
            original._retry = true
            original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` }
            resolve(apiClient.request(original))
          })
        })
      }

      isRefreshing = true
      original._retry = true
      try {
        const { data } = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken: refresh })
        const newAccess = data.data.accessToken as string
        const newRefresh = data.data.refreshToken as string
        setTokens(newAccess, newRefresh)
        refreshQueue.forEach((cb) => cb(newAccess))
        refreshQueue = []
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newAccess}` }
        return apiClient.request(original)
      } catch (refreshErr) {
        refreshQueue.forEach((cb) => cb(null))
        refreshQueue = []
        clearTokens()
        redirectToSignIn()
        return Promise.reject(normalizeError(refreshErr as AxiosError))
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(normalizeError(err))
  }
)

// ---------------------------------------------------------------------------
//  Normalized error
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function normalizeError(err: AxiosError): ApiError {
  const status = err.response?.status ?? 0
  const data = err.response?.data as { error?: { message?: string; details?: unknown } } | undefined
  const message =
    data?.error?.message ||
    err.message ||
    'Đã xảy ra lỗi, vui lòng thử lại'
  return new ApiError(message, status, data?.error?.details)
}

function redirectToSignIn() {
  if (typeof window === 'undefined') return
  if (window.location.pathname.startsWith('/sign-in')) return
  const next = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `/sign-in?redirect=${next}`
}
