/**
 * State Management Types
 *
 * Type definitions for application state
 */

import type { Message, ResponseMetadata } from './Message'
import type { ChatConfig, UserSettings } from './ChatConfig'
import type { ApiError } from './API'

/**
 * Chat state
 *
 * State of the chat application
 */
export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: ApiError | null
  config: ChatConfig | null
  settings: UserSettings
  connectionStatus: 'connected' | 'disconnected' | 'error'
}

/**
 * Chat actions
 *
 * Actions for modifying chat state
 */
export type ChatAction =
  | {
      type: 'ADD_MESSAGE'
      payload: Message
    }
  | {
      type: 'UPDATE_MESSAGE'
      payload: { id: string; updates: Partial<Message> }
    }
  | {
      type: 'REMOVE_MESSAGE'
      payload: string
    }
  | {
      type: 'CLEAR_MESSAGES'
    }
  | {
      type: 'SET_LOADING'
      payload: boolean
    }
  | {
      type: 'SET_ERROR'
      payload: ApiError | null
    }
  | {
      type: 'SET_CONFIG'
      payload: ChatConfig
    }
  | {
      type: 'UPDATE_SETTINGS'
      payload: Partial<UserSettings>
    }
  | {
      type: 'SET_CONNECTION_STATUS'
      payload: 'connected' | 'disconnected' | 'error'
    }

/**
 * UI state
 *
 * State of UI components
 */
export interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  settingsOpen: boolean
  showDebugInfo: boolean
  notifications: Notification[]
}

/**
 * UI actions
 *
 * Actions for modifying UI state
 */
export type UIAction =
  | {
      type: 'SET_THEME'
      payload: 'light' | 'dark'
    }
  | {
      type: 'TOGGLE_SIDEBAR'
    }
  | {
      type: 'TOGGLE_SETTINGS'
    }
  | {
      type: 'SET_DEBUG_INFO'
      payload: boolean
    }
  | {
      type: 'ADD_NOTIFICATION'
      payload: Notification
    }
  | {
      type: 'REMOVE_NOTIFICATION'
      payload: string
    }
  | {
      type: 'CLEAR_NOTIFICATIONS'
    }

/**
 * Notification
 *
 * A notification to display to the user
 */
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number // milliseconds, 0 = permanent
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: Date
}

/**
 * App state
 *
 * Complete application state
 */
export interface AppState {
  chat: ChatState
  ui: UIState
}

/**
 * Async operation state
 *
 * State for an async operation
 */
export interface AsyncOperationState<T = unknown> {
  loading: boolean
  data: T | null
  error: Error | null
  success: boolean
  lastUpdated: Date | null
}

/**
 * Async thunk action
 *
 * Action creator for async operations
 */
export interface AsyncThunkAction<T = unknown> {
  pending: () => void
  fulfilled: (data: T) => void
  rejected: (error: Error) => void
}

/**
 * Chat statistics
 *
 * Statistics about the chat session
 */
export interface ChatStatistics {
  totalMessages: number
  userMessages: number
  aiMessages: number
  totalTokens: number
  totalProcessingTime: number // milliseconds
  averageResponseTime: number // milliseconds
  messagesWithCode: number
  uniqueLanguages: Set<string>
  startTime: Date
  endTime?: Date
}

/**
 * Calculate chat statistics
 */
export function calculateChatStatistics(messages: Message[]): ChatStatistics {
  let totalTokens = 0
  let totalProcessingTime = 0
  let messagesWithCode = 0
  const uniqueLanguages = new Set<string>()
  const userMessages = messages.filter((m) => m.sender === 'user').length
  const aiMessages = messages.filter((m) => m.sender === 'ai').length

  messages.forEach((message) => {
    if (message.metadata) {
      totalTokens += message.metadata.tokens_estimated || 0
      totalProcessingTime += message.metadata.processing_time_ms || 0

      if (message.metadata.has_code) {
        messagesWithCode++
        message.metadata.code_languages?.forEach((lang) =>
          uniqueLanguages.add(lang)
        )
      }
    }
  })

  const averageResponseTime =
    aiMessages > 0 ? totalProcessingTime / aiMessages : 0

  return {
    totalMessages: messages.length,
    userMessages,
    aiMessages,
    totalTokens,
    totalProcessingTime,
    averageResponseTime,
    messagesWithCode,
    uniqueLanguages,
    startTime: new Date(),
  }
}
