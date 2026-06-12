/**
 * Auth store — backwards-compatible wrapper.
 *
 * Existing components destructure `useAuthStore().auth` to get
 * `{ user, setUser, reset }`. We keep that exact shape, but the
 * implementations now call the real backend (via `lib/api-client`).
 *
 * User persistence is managed by api-client.ts — single source of truth.
 */
import { create } from 'zustand'
import { getUser, type AuthUser, clearTokens, getAccessToken, setUser as persistUser } from '@/lib/api-client'

interface AuthSlice {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  setAccessToken: (token: string) => void
  accessToken: string
  resetAccessToken: () => void
  reset: () => void
}

interface AuthState {
  auth: AuthSlice
}

export const useAuthStore = create<AuthState>((set) => ({
  auth: {
    user: getUser(),
    accessToken: getAccessToken() ?? '',
    setUser: (user) => {
      if (user) persistUser(user)
      set((s) => ({ auth: { ...s.auth, user } }))
    },
    setAccessToken: (accessToken) => {
      // Tokens are managed by api-client. Keep for backward compatibility.
      set((s) => ({ auth: { ...s.auth, accessToken } }))
    },
    resetAccessToken: () => set((s) => ({ auth: { ...s.auth, accessToken: '' } })),
    reset: () => {
      clearTokens()
      set((s) => ({ auth: { ...s.auth, user: null, accessToken: '' } }))
    },
  },
}))
