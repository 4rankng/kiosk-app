import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'kiosk_access_token'
const USER_DATA = 'kiosk_user_data'

export interface AuthUser {
  name: string
  email: string
  avatar: string
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_DATA)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(USER_DATA, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_DATA)
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  const initUser = initToken ? loadUser() : null

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          saveUser(user)
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          saveUser(null)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
