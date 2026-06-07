import { createContext, useContext } from 'react'

type ThemeProviderState = {
  theme: 'light'
  resolvedTheme: 'light'
  setTheme: (theme: 'light') => void
  resetTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => null,
  resetTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const contextValue = {
    theme: 'light' as const,
    resolvedTheme: 'light' as const,
    setTheme: () => null,
    resetTheme: () => null,
  }

  return <ThemeContext value={contextValue}>{children}</ThemeContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
