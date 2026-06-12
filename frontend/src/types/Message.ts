/**
 * Message Types
 *
 * Comprehensive type definitions for all message-related data structures.
 * Used throughout the app for chat messages, responses, and formatting.
 */

export type MessageSender = 'user' | 'ai' | 'system'
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'error'

/**
 * Individual message in chat
 *
 * Represents a single message in the conversation
 */
export interface Message {
  id: string
  text: string
  sender: MessageSender
  timestamp: string
  status?: MessageStatus
  isError?: boolean

  // Content metadata
  formattedBlocks?: FormattedBlock[]
  metadata?: MessageMetadata
}

/**
 * Metadata about a message
 *
 * Additional information about message generation
 */
export interface MessageMetadata {
  // LLM generation metadata (only for AI messages)
  role?: string
  temperature?: number
  max_tokens_used?: number
  tokens_estimated?: number
  model_used?: string
  processing_time_ms?: number

  // Content analysis metadata
  has_code?: boolean
  code_languages?: string[]
  has_markdown?: boolean
  block_count?: number

  // Error metadata
  error_code?: string
  error_detail?: string
}

/**
 * Type of content block
 *
 * Different types of content that can appear in a formatted response
 */
export type BlockType =
  | 'paragraph'
  | 'code'
  | 'heading'
  | 'list'
  | 'quote'
  | 'bold'
  | 'italic'
  | 'link'
  | 'table'

/**
 * A single formatted block of content
 *
 * Represents a single piece of content after parsing markdown.
 * Frontend uses this to render different content types appropriately.
 */
export interface FormattedBlock {
  type: BlockType
  content: string

  // Type-specific metadata
  metadata?: {
    // For code blocks
    language?: string

    // For headings
    level?: number

    // For links
    url?: string

    // For lists
    items?: string[]

    // Generic metadata
    [key: string]: unknown
  }
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

/**
 * Chat response from the API
 *
 * Complete response from the backend containing the AI response
 * and all metadata about how it was generated and formatted
 */
export interface ChatResponse {
  response: string
  success: boolean

  // LLM metadata
  role_used?: string
  temperature_used?: number
  max_tokens_used?: number
  tokens_estimated?: number
  model_used?: string
  timestamp?: string
  processing_time_ms?: number

  // Formatted response
  formatted_blocks?: FormattedBlock[]
  formatting_metadata?: ResponseMetadata
}

/**
 * API error response
 *
 * Error response from the backend with details
 */
export interface ErrorMessage {
  detail: string
  status_code: number
  error_code?: string
  timestamp?: string
  request_id?: string
}

/**
 * Type guard to check if response is successful
 */
export function isChatResponse(
  response: unknown
): response is ChatResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'response' in response &&
    'success' in response
  )
}

/**
 * Type guard to check if response is an error
 */
export function isErrorMessage(response: unknown): response is ErrorMessage {
  return (
    typeof response === 'object' &&
    response !== null &&
    'detail' in response &&
    'status_code' in response
  )
}
