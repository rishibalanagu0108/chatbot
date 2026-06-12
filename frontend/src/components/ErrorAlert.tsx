/**
 * ErrorAlert Component
 *
 * Displays error messages with dismiss and retry options.
 */

import { Card, CardContent } from './ui/index'
import type { ApiError } from '../types'

interface ErrorAlertProps {
  error: ApiError | null
  onDismiss: () => void
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorAlert({
  error,
  onDismiss,
  onRetry,
  showRetry = true,
}: ErrorAlertProps) {
  if (!error) return null

  return (
    <Card className="border-destructive bg-destructive/10">
      <CardContent className="p-4 space-y-3">
        {/* Error message */}
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-destructive">Error</h3>
          <p className="text-sm text-destructive/80">{error.detail}</p>
          {error.error_code && (
            <p className="text-xs text-destructive/60">
              Code: {error.error_code}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors underline"
            >
              Retry
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors underline"
          >
            Dismiss
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
