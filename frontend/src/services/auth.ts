/**
 * Auth service — talks to /api/auth/*.
 * Replaces the previous MOCK_CREDENTIALS / hardcoded whitelist.
 */
import { apiClient, setTokens, setUser, type AuthUser } from '@/lib/api-client'

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


export async function register(input: {
  email: string
  name: string
  password: string
  role?: 'admin' | 'staff'
}): Promise<AuthUser> {
  const { data } = await apiClient.post<{ data: AuthUser }>('/api/auth/register', input)
  return data.data
}
