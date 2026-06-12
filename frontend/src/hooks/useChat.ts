/**
 * useChat Hook
 *
 * Custom hook for chat operations.
 * Manages chat state, API calls, and message handling.
 */

import { useState, useCallback } from 'react'
import type {
  ChatRequestPayload,
  ChatApiResponse,
  ApiError,
  Message,
} from '@/types'
import { chatService } from '@/services'
import { generateId, getTimestamp } from '@/lib/utils'
import { useToast } from './useToast'

/**
 * useChat Hook
 *
 * Provides functions and state for chat operations
 */
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const { toast } = useToast()

  /**
   * Add a user message
   */
  const addUserMessage = useCallback((text: string) => {
    const message: Message = {
      id: generateId(),
      text,
      sender: 'user',
      timestamp: getTimestamp(),
      status: 'sent',
    }
    setMessages((prev) => [...prev, message])
    return message
  }, [])

  /**
   * Add an AI message
   */
  const addAiMessage = useCallback((response: ChatApiResponse) => {
    const message: Message = {
      id: generateId(),
      text: response.response,
      sender: 'ai',
      timestamp: getTimestamp(),
      status: 'delivered',
      formattedBlocks: response.formatted_blocks,
      metadata: {
        role: response.role_used,
        temperature: response.temperature_used,
        max_tokens_used: response.max_tokens_used,
        tokens_estimated: response.tokens_estimated,
        model_used: response.model_used,
        processing_time_ms: response.processing_time_ms,
        has_code: response.formatting_metadata?.has_code,
        code_languages: response.formatting_metadata?.code_languages,
        has_markdown: response.formatting_metadata?.has_markdown,
        block_count: response.formatting_metadata?.block_count,
      },
    }
    setMessages((prev) => [...prev, message])
    return message
  }, [])

  /**
   * Add an error message
   */
  const addErrorMessage = useCallback((errorData: ApiError) => {
    const message: Message = {
      id: generateId(),
      text: errorData.detail,
      sender: 'system',
      timestamp: getTimestamp(),
      status: 'error',
      isError: true,
      metadata: {
        error_code: errorData.error_code,
        error_detail: errorData.detail,
      },
    }
    setMessages((prev) => [...prev, message])
    return message
  }, [])

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (payload: ChatRequestPayload): Promise<ChatApiResponse | null> => {
      setError(null)
      setIsLoading(true)

      try {
        // Add user message
        addUserMessage(payload.message)

        try {
          // Send to API
          const response = await chatService.sendMessage(payload)

          // Add AI response
          addAiMessage(response)

          // Show success toast
          toast.success({
            title: 'Message sent',
            description: `Response received in ${response.processing_time_ms}ms`,
          })

          return response
        } catch (apiError) {
          // Handle API error
          const apiErrorData = apiError as ApiError
          setError(apiErrorData)
          addErrorMessage(apiErrorData)

          // Show error toast with retry option
          toast.error({
            title: 'Failed to send message',
            description: apiErrorData.detail,
          })

          return null
        }
      } finally {
        setIsLoading(false)
      }
    },
    [addUserMessage, addAiMessage, addErrorMessage, toast]
  )

  /**
   * Retry sending a message
   */
  const retryMessage = useCallback(
    async (messageId: string, payload: ChatRequestPayload) => {
      // Find the error message to retry
      const messageIndex = messages.findIndex((m) => m.id === messageId)
      if (messageIndex === -1) return

      // Remove error message
      setMessages((prev) => prev.filter((m) => m.id !== messageId))

      // Retry
      return sendMessage(payload)
    },
    [messages, sendMessage]
  )

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  /**
   * Remove a message
   */
  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
  }, [])

  /**
   * Update a message
   */
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m))
      )
    },
    []
  )

  return {
    // State
    messages,
    isLoading,
    error,

    // Actions
    sendMessage,
    addUserMessage,
    addAiMessage,
    addErrorMessage,
    retryMessage,
    clearMessages,
    removeMessage,
    updateMessage,
    setError,
  }
}

export default useChat
