/**
 * Auth store — backwards-compatible wrapper.
 *
 * Existing components destructure `useAuthStore().auth` to get
 * `{ user, setUser, reset }`. We keep that exact shape, but the
 * implementations now call the real backend (via `lib/api-client`).
 */
import { create } from 'zustand'
import { getUser, type AuthUser, clearTokens, getAccessToken } from '@/lib/api-client'

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

function persistUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem('kiosk_user_data', JSON.stringify(user))
  } else {
    localStorage.removeItem('kiosk_user_data')
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  auth: {
    user: getUser(),
    accessToken: getAccessToken() ?? '',
    setUser: (user) => {
      persistUser(user)
      set((s) => ({ auth: { ...s.auth, user } }))
    },
    setAccessToken: (accessToken) => {
      // Tokens are already managed by api-client. Keep this no-op for
      // backward compatibility with existing components.
      set((s) => ({ auth: { ...s.auth, accessToken } }))
      void get
    },
    resetAccessToken: () => set((s) => ({ auth: { ...s.auth, accessToken: '' } })),
    reset: () => {
      clearTokens()
      set((s) => ({ auth: { ...s.auth, user: null, accessToken: '' } }))
    },
  },
}))
