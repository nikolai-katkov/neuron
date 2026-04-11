import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { ColorMode, Theme } from '../types'
import { loadColorMode, loadTheme, saveColorMode, saveTheme } from '../utils'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorMode: ColorMode
  setColorMode: (mode: ColorMode) => void
  toggleColorMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
ThemeContext.displayName = 'ThemeContext'

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: Theme
  initialColorMode?: ColorMode
}

export function ThemeProvider({ children, initialTheme, initialColorMode }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => initialTheme ?? loadTheme())
  const [colorMode, setColorModeState] = useState<ColorMode>(
    () => initialColorMode ?? loadColorMode()
  )

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    saveTheme(newTheme)
  }, [])

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode)
    saveColorMode(mode)
  }, [])

  const toggleColorMode = useCallback(() => {
    setColorModeState(previous => {
      const next = previous === 'light' ? 'dark' : 'light'
      saveColorMode(next)
      return next
    })
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.mode = colorMode
  }, [theme, colorMode])

  const value = useMemo(
    () => ({ theme, setTheme, colorMode, setColorMode, toggleColorMode }),
    [theme, setTheme, colorMode, setColorMode, toggleColorMode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
