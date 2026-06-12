/**
 * ChatMessage Component
 *
 * Displays individual chat messages with formatting.
 */

import { Message } from '../types'
import { Card, CardContent } from './ui/index'
import { MarkdownRenderer } from './MarkdownRenderer'
import { cn } from '../lib/utils'

interface ChatMessageProps {
  message: Message
  onRetry?: () => void
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.sender === 'user'
  const isError = message.isError || message.status === 'error'
  const hasFormattedBlocks = message.formattedBlocks && message.formattedBlocks.length > 0

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
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold flex-shrink-0 mt-1',
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
          'max-w-2xl rounded-lg p-0',
          isUser
            ? 'bg-primary text-primary-foreground'
            : isError
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted'
        )}
      >
        <CardContent className={cn('p-0', !isError && 'p-4')}>
          {/* Rendered markdown or plain text */}
          {hasFormattedBlocks && !isUser && message.formattedBlocks ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownRenderer blocks={message.formattedBlocks} />
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.text}
            </p>
          )}

          {/* Metadata */}
          {message.metadata && !isError && (
            <div className={cn(
              'mt-2 text-xs opacity-60 space-y-1 border-t border-border/30 pt-2',
              isUser && 'text-primary-foreground/60'
            )}>
              {message.metadata.role && (
                <p>Role: {message.metadata.role}</p>
              )}
              {message.metadata.processing_time_ms && (
                <p>⏱️ {message.metadata.processing_time_ms}ms</p>
              )}
              {message.metadata.tokens_estimated && (
                <p>📊 ~{message.metadata.tokens_estimated} tokens</p>
              )}
            </div>
          )}

          {/* Retry Button */}
          {isError && onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-3 py-1 text-xs border border-destructive rounded hover:bg-destructive/20 transition-colors"
            >
              Retry
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
