/**
 * Main App Component
 *
 * Root component that sets up the application structure
 */

import { useEffect } from 'react'
import { useTheme } from '@/hooks'
import { ChatPage } from '@/pages'
import '@/styles/globals.css'

export default function App() {
  const { theme } = useTheme()

  // Apply theme to document on mount and when it changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <ChatPage />
    </div>
  )
}
