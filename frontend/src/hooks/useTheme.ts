/**
 * useTheme Hook
 *
 * Custom hook for managing application theme (light/dark mode).
 */

import { useState, useEffect, useCallback } from 'react'
import { storageService } from '@/services'

/**
 * useTheme Hook
 *
 * Manages light/dark theme state and persistence
 */
export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    // Get theme from storage or system preference
    const stored = storageService.getTheme()
    if (stored) return stored

    // Check system preference
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark ? 'dark' : 'light'
    }

    return 'light'
  })

  /**
   * Apply theme to document
   */
  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    const root = document.documentElement

    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Store preference
    storageService.setTheme(newTheme)
  }, [])

  /**
   * Set theme
   */
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
    applyTheme(newTheme)
  }, [applyTheme])

  /**
   * Toggle between light and dark
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  /**
   * Use system preference
   */
  const useSystemTheme = useCallback(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDark ? 'dark' : 'light')
  }, [setTheme])

  /**
   * Listen to system theme changes
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set theme
      const stored = storageService.exists('app:theme')
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [setTheme])

  /**
   * Apply theme on mount
   */
  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
    useSystemTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}

export default useTheme
