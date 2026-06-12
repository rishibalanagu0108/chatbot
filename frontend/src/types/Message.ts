/**
 * Message Types
 *
 * Defines all message-related types used in the application
 */

export type MessageSender = 'user' | 'ai' | 'system'

export interface Message {
  id: string
  text: string
  sender: MessageSender
  timestamp: string
  isError?: boolean
  metadata?: {
    role?: string
    temperature?: number
    tokens?: number
  }
}

export interface FormattedBlock {
  type:
    | 'paragraph'
    | 'code'
    | 'heading'
    | 'list'
    | 'quote'
    | 'bold'
    | 'italic'
    | 'link'
    | 'table'
  content: string
  metadata?: Record<string, unknown>
}

export interface ResponseMetadata {
  has_code: boolean
  code_languages: string[]
  has_markdown: boolean
  block_count: number
  code_block_count: number
  character_count: number
}

export interface ChatMessage {
  message: string
  role?: string
  temperature?: number
  temperature_preset?: 'precise' | 'balanced' | 'creative'
  max_tokens?: number
}

export interface ChatResponse {
  response: string
  success: boolean
  role_used?: string
  temperature_used?: number
  max_tokens_used?: number
  tokens_estimated?: number
  model_used?: string
  timestamp?: string
  processing_time_ms?: number
  formatted_blocks?: FormattedBlock[]
  formatting_metadata?: ResponseMetadata
}

export interface ErrorMessage {
  detail: string
  status_code: number
  error_code?: string
  timestamp?: string
  request_id?: string
}
