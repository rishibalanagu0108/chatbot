/**
 * Main App Component
 *
 * Root component that sets up the application structure
 */

import { useEffect } from 'react'
import { useTheme, useToast } from '@/hooks'
import { ChatPage } from '@/pages'
import { ToastContainer, ErrorBoundary } from '@/components'
import '@/styles/globals.css'

function AppContent() {
  const { theme } = useTheme()
  const { notifications, removeNotification } = useToast()

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
        <ToastContainer
          notifications={notifications}
          onRemove={removeNotification}
        />
      </ErrorBoundary>
    </div>
  )
}

export default function App() {
  return <AppContent />
}
