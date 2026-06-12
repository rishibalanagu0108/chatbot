/**
 * Main App Component
 *
 * Root component that sets up the application structure
 */

import { useState, useEffect } from 'react'
import { ChatConfig, DEFAULT_SETTINGS } from '@/types/ChatConfig'
import '@/styles/globals.css'

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [config, setConfig] = useState<ChatConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/chat/config')
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
        }
      } catch (error) {
        console.error('Failed to fetch config:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-4xl">🤖</div>
          <p className="text-foreground">Loading AI Chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Chat</h1>
            <p className="text-sm text-muted-foreground">
              Powered by Google Gemini
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg bg-muted p-2 hover:bg-muted/80"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-6xl">🚀</div>
            <h2 className="mb-2 text-2xl font-bold">Welcome to AI Chat</h2>
            <p className="text-muted-foreground">
              Frontend setup complete! Ready to build components.
            </p>
            {config && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Connected to API v{config.api_version}</p>
                <p>{config.roles.length} roles available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
