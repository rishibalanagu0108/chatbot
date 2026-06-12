/**
 * API Configuration
 *
 * Central place to manage API base URL and endpoints
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000'

export const API_ENDPOINTS = {
  // Chat endpoints
  chat: `${API_BASE_URL}/api/chat/chat`,
  config: `${API_BASE_URL}/api/chat/config`,

  // Health check
  health: `${API_BASE_URL}/health`,
} as const

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  retries: 3,
} as const

export default API_ENDPOINTS
