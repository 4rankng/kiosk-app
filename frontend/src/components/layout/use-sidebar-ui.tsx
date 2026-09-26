import { createContext, useContext, useState } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'

const SIDEBAR_COOKIE = 'sidebar_state'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

type SidebarUIContextType = {
  /** Desktop icon-rail collapsed state, cookie-persisted. */
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  /** Mobile offcanvas drawer open state. */
  open: boolean
  setOpen: (v: boolean) => void
}

const SidebarUIContext = createContext<SidebarUIContextType | null>(null)

export function SidebarUIProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean>(() => getCookie(SIDEBAR_COOKIE) === 'false')
  const [open, setOpenState] = useState(false)

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v)
    setCookie(SIDEBAR_COOKIE, String(!v), COOKIE_MAX_AGE)
  }

  const setOpen = (v: boolean) => {
    setOpenState(v)
  }

  return (
    <SidebarUIContext.Provider value={{ collapsed, setCollapsed, open, setOpen }}>
      {children}
    </SidebarUIContext.Provider>
  )
}

export function useSidebarUI() {
  const ctx = useContext(SidebarUIContext)
  if (!ctx) throw new Error('useSidebarUI must be used within SidebarUIProvider')
  return ctx
}
