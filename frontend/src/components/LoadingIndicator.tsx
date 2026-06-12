/**
 * LoadingIndicator Component
 *
 * Shows loading state while waiting for API response.
 */

import { Skeleton } from '@/components/ui'
import { Card } from '@/components/ui'

interface LoadingIndicatorProps {
  message?: string
  showSkeletons?: boolean
}

export function LoadingIndicator({
  message = 'Thinking...',
  showSkeletons = true,
}: LoadingIndicatorProps) {
  return (
    <div className="flex gap-3 animate-in fade-in-50 duration-200">
      {/* Avatar */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
        A
      </div>

      {/* Loading card */}
      <Card className="max-w-md rounded-lg p-3 bg-muted">
        {showSkeletons ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200" />
            </div>
            <span className="text-sm text-muted-foreground">{message}</span>
          </div>
        )}
      </Card>
    </div>
  )
}
