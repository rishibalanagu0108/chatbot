/**
 * MessageInput Component
 *
 * Input field for sending chat messages.
 */

import { useRef, useState } from 'react'
import { Button, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  maxLength?: number
}

export function MessageInput({
  onSend,
  isLoading = false,
  placeholder = 'Type your message...',
  maxLength = 5000,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSend(message)
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, but allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setMessage(value)

      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
      }
    }
  }

  const remainingChars = maxLength - message.length

  return (
    <div className="flex flex-col gap-2">
      {/* Character count */}
      <div className="text-xs text-muted-foreground text-right">
        {message.length} / {maxLength}
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            'resize-none min-h-[44px] max-h-[200px]',
            remainingChars < 100 && remainingChars >= 0 && 'border-yellow-500',
            remainingChars < 0 && 'border-red-500'
          )}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          size="lg"
          className="self-end"
        >
          {isLoading ? (
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </div>
  )
}
