/**
 * Auth service — talks to /api/auth/*.
 * Replaces the previous MOCK_CREDENTIALS / hardcoded whitelist.
 */
import { apiClient, setTokens, setUser, clearTokens, getUser, type AuthUser } from '@/lib/api-client'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export async function signInWithEmail(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<{ data: AuthResponse }>('/api/auth/login', payload)
  setTokens(data.data.accessToken, data.data.refreshToken)
  setUser(data.data.user)
  return data.data
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  // 1. Get OAuth URL from backend
  const { data: urlData } = await apiClient.get<{ data: { url: string } }>('/api/auth/google/url')
  // 2. Redirect to Google — when user returns, the callback page will POST
  //    the auth code to /api/auth/google and then redirect back.
  window.location.href = urlData.data.url
  // Will never resolve — the page will navigate away.
  return new Promise(() => {})
}

export async function exchangeGoogleCode(code: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<{ data: AuthResponse }>('/api/auth/google', { code })
  setTokens(data.data.accessToken, data.data.refreshToken)
  setUser(data.data.user)
  return data.data
}

export async function register(input: {
  email: string
  name: string
  password: string
  role?: 'admin' | 'staff'
}): Promise<AuthUser> {
  const { data } = await apiClient.post<{ data: AuthUser }>('/api/auth/register', input)
  return data.data
}

export async function signOut(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout')
  } catch {
    // ignore — clearing local state is enough
  }
  clearTokens()
}

export function getCurrentUser(): AuthUser | null {
  return getUser()
}
