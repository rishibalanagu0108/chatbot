/**
 * API Client
 *
 * Low-level HTTP client for all API communication.
 * Handles:
 * - Request/response interceptors
 * - Error handling and transformation
 * - Retry logic
 * - Request timeout
 * - Content-Type management
 */

import type { ApiRequestOptions, ApiResponseWrapper } from '@/types'
import type { ApiError } from '@/types'

/**
 * Default API client configuration
 */
const DEFAULT_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
} as const

/**
 * API Client Class
 *
 * Provides low-level HTTP methods for API communication
 */
export class ApiClient {
  private baseURL: string
  private timeout: number
  private retries: number

  constructor(
    baseURL: string,
    timeout = DEFAULT_CONFIG.timeout,
    retries = DEFAULT_CONFIG.retries
  ) {
    this.baseURL = baseURL
    this.timeout = timeout
    this.retries = retries
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * Make a POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data,
    })
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * Core request method with retry logic
   */
  private async request<T>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
      retries = this.retries,
    } = options

    const fullURL = this.buildURL(url)
    const attempt = async (retryCount: number): Promise<T> => {
      const startTime = Date.now()

      try {
        const response = await this.fetchWithTimeout(fullURL, {
          method,
          headers: this.buildHeaders(headers),
          body: body ? JSON.stringify(body) : undefined,
          timeout,
        })

        const duration = Date.now() - startTime

        // Parse response
        const contentType = response.headers.get('content-type')
        const isJSON = contentType?.includes('application/json')
        const data = isJSON ? await response.json() : await response.text()

        // Handle error responses
        if (!response.ok) {
          throw this.createApiError(response, data)
        }

        return data as T
      } catch (error) {
        // Check if we should retry
        if (retryCount < retries && this.shouldRetry(error)) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, retryCount) * 1000
          await this.sleep(delay)
          return attempt(retryCount + 1)
        }

        // Re-throw the error
        throw error
      }
    }

    return attempt(0)
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout: number }
  ): Promise<Response> {
    const { timeout, ...fetchOptions } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`)
      }

      throw error
    }
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      // Retry on timeout
      if (error.message.includes('timeout')) return true

      // Retry on network errors
      if (error.message.includes('Failed to fetch')) return true

      // Don't retry on known client errors
      if (error.message.includes('400') || error.message.includes('401'))
        return false
      if (error.message.includes('403') || error.message.includes('404'))
        return false
    }

    return false
  }

  /**
   * Build full URL
   */
  private buildURL(url: string): string {
    // If URL is absolute, use it directly
    if (url.startsWith('http')) return url

    // Otherwise, prepend base URL
    return `${this.baseURL}${url.startsWith('/') ? url : '/' + url}`
  }

  /**
   * Build request headers
   */
  private buildHeaders(customHeaders: Record<string, string> = {}) {
    return {
      'Content-Type': 'application/json',
      ...customHeaders,
    }
  }

  /**
   * Create API error from response
   */
  private createApiError(response: Response, data: unknown): ApiError {
    const isErrorObject =
      typeof data === 'object' &&
      data !== null &&
      'detail' in data &&
      'status_code' in data

    if (isErrorObject) {
      return data as ApiError
    }

    return {
      detail:
        typeof data === 'string'
          ? data
          : `HTTP ${response.status}: ${response.statusText}`,
      status_code: response.status,
      error_code: `HTTP_${response.status}`,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Global API client instance
 */
export const apiClient = new ApiClient(
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
)

export default apiClient
