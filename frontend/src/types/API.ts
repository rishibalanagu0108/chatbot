/**
 * API Request and Response Types
 *
 * Type definitions for all API communication
 */

import type {
  ChatResponse,
  ErrorMessage,
  FormattedBlock,
  ResponseMetadata,
} from './Message'
import type { ChatConfig, LLMRole, TemperaturePreset } from './ChatConfig'

/**
 * Chat request payload
 *
 * Data sent to the backend when requesting a chat response
 */
export interface ChatRequestPayload {
  message: string
  role?: LLMRole
  temperature?: number
  temperature_preset?: TemperaturePreset
  max_tokens?: number
}

/**
 * Chat API response
 *
 * Complete response from /api/chat/chat endpoint
 */
export interface ChatApiResponse extends ChatResponse {
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

/**
 * Config API response
 *
 * Response from /api/chat/config endpoint
 */
export interface ConfigApiResponse extends ChatConfig {
  roles: Array<{
    name: LLMRole
    description: string
  }>
  temperature_presets: Record<TemperaturePreset, number>
  default_temperature: number
  default_max_tokens: number
  min_message_length: number
  max_message_length: number
  min_temperature: number
  max_temperature: number
  api_version: string
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error'
  message: string
  timestamp?: string
}

/**
 * Generic API error response
 */
export interface ApiError extends ErrorMessage {
  detail: string
  status_code: number
  error_code?: string
  timestamp?: string
  request_id?: string
}

/**
 * API request options
 *
 * Options for making API requests
 */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  retries?: number
}

/**
 * API response wrapper
 *
 * Wrapper for API responses with metadata
 */
export interface ApiResponseWrapper<T> {
  data?: T
  error?: ApiError
  status: number
  statusText: string
  headers: Record<string, string>
  timestamp: string
  duration: number // milliseconds
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error &&
    'status_code' in error
  )
}

/**
 * Type guard for successful chat response
 */
export function isChatApiResponse(
  response: unknown
): response is ChatApiResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'response' in response &&
    'success' in response &&
    (response as { success: unknown }).success === true
  )
}
