/**
 * Main App Component
 *
 * Root component that sets up the application structure with professional UI
 */

import { useEffect } from 'react'
import { useTheme } from './hooks'
import { ChatPage } from './pages'
import { Toaster, ErrorBoundary } from './components'
import './styles/globals.css'

function AppContent() {
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
      <ErrorBoundary>
        <ChatPage />
        <Toaster />
      </ErrorBoundary>
    </div>
  )
}

export default function App() {
  return <AppContent />
}
