/**
 * ErrorBoundary Component
 *
 * React error boundary for catching and displaying errors gracefully.
 */

import { Component, ReactNode } from 'react'
import { Card, CardContent } from './ui/index'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <Card className="w-full max-w-md border-destructive">
            <CardContent className="p-6 space-y-4">
              {/* Error icon */}
              <div className="flex justify-center">
                <div className="text-5xl">⚠️</div>
              </div>

              {/* Error message */}
              <div className="space-y-2 text-center">
                <h1 className="text-xl font-bold text-destructive">
                  Something went wrong
                </h1>
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred in the application.
                </p>
              </div>

              {/* Error details (in development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-muted p-3 rounded-md overflow-auto max-h-40">
                  <p className="text-xs font-mono text-destructive break-words">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap break-words">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors font-medium text-sm"
                >
                  Reload Page
                </button>
              </div>

              {/* Help text */}
              <p className="text-xs text-muted-foreground text-center pt-2">
                If the problem persists, please refresh the page or contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
