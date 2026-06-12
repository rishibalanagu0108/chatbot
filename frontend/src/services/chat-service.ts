/**
 * Chat Service
 *
 * High-level service for chat operations.
 * Provides type-safe methods for:
 * - Sending chat messages
 * - Getting configuration
 * - Health checks
 */

import type {
  ChatRequestPayload,
  ChatApiResponse,
  ConfigApiResponse,
  HealthResponse,
} from '@/types'
import { apiClient } from './api-client'
import { API_ENDPOINTS } from '@/config/api'

/**
 * Chat Service Class
 *
 * Encapsulates all chat-related API operations
 */
export class ChatService {
  /**
   * Send a chat message
   *
   * Sends a user message to the LLM and gets a response
   */
  async sendMessage(payload: ChatRequestPayload): Promise<ChatApiResponse> {
    return apiClient.post<ChatApiResponse>(API_ENDPOINTS.chat, payload)
  }

  /**
   * Get chat configuration
   *
   * Fetches available roles, temperature presets, and constraints
   */
  async getConfig(): Promise<ConfigApiResponse> {
    return apiClient.get<ConfigApiResponse>(API_ENDPOINTS.config)
  }

  /**
   * Check server health
   *
   * Verifies the server is running and healthy
   */
  async checkHealth(): Promise<HealthResponse> {
    return apiClient.get<HealthResponse>(API_ENDPOINTS.health)
  }

  /**
   * Send message with auto-retry
   *
   * Enhanced version that retries on specific errors
   */
  async sendMessageWithRetry(
    payload: ChatRequestPayload,
    maxRetries = 3
  ): Promise<ChatApiResponse> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendMessage(payload)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't retry on validation errors
        if (
          lastError.message.includes('400') ||
          lastError.message.includes('422')
        ) {
          throw lastError
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Failed to send message after retries')
  }

  /**
   * Check health with retry
   *
   * Retries health check if server is temporarily unavailable
   */
  async checkHealthWithRetry(maxRetries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const health = await this.checkHealth()
        return health.status === 'ok'
      } catch (error) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    return false
  }

  /**
   * Stream chat message (future implementation)
   *
   * For server-sent events or WebSocket support
   */
  async streamMessage(
    payload: ChatRequestPayload
  ): Promise<ChatApiResponse> {
    // TODO: Implement streaming when backend supports it
    return this.sendMessage(payload)
  }
}

/**
 * Global chat service instance
 */
export const chatService = new ChatService()

export default chatService
