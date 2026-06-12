/**
 * ChatMessage Component
 *
 * Displays individual chat messages with formatting.
 */

import { Message } from '@/types'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
  onRetry?: () => void
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.sender === 'user'
  const isError = message.isError || message.status === 'error'

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in-50 duration-200',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
          isUser
            ? 'bg-primary text-primary-foreground'
            : isError
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-secondary text-secondary-foreground'
        )}
      >
        {isUser ? 'U' : isError ? '!' : 'A'}
      </div>

      {/* Message Content */}
      <Card
        className={cn(
          'max-w-md rounded-lg p-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : isError
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted'
        )}
      >
        <CardContent className="p-0">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>

          {/* Metadata */}
          {message.metadata && !isError && (
            <div className="mt-2 text-xs opacity-60 space-y-1">
              {message.metadata.role && (
                <p>Role: {message.metadata.role}</p>
              )}
              {message.metadata.processing_time_ms && (
                <p>Time: {message.metadata.processing_time_ms}ms</p>
              )}
            </div>
          )}

          {/* Retry Button */}
          {isError && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs underline hover:opacity-70 transition-opacity"
            >
              Retry
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
