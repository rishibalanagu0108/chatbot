/**
 * useConfig Hook
 *
 * Custom hook for managing chat configuration.
 * Fetches and caches configuration from the backend.
 */

import { useState, useEffect, useCallback } from 'react'
import type { ChatConfig, ApiError } from '@/types'
import { chatService, storageService } from '@/services'

/**
 * useConfig Hook
 *
 * Manages loading and caching of chat configuration
 */
export function useConfig(cacheMaxAge = 3600000) {
  const [config, setConfig] = useState<ChatConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  /**
   * Fetch configuration from API
   */
  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to get from cache first
      const cachedConfig = storageService.getCachedConfig<ChatConfig>(cacheMaxAge)
      if (cachedConfig) {
        setConfig(cachedConfig)
        return cachedConfig
      }

      // Fetch from API
      const newConfig = await chatService.getConfig()
      setConfig(newConfig)

      // Cache the config
      storageService.setCachedConfig(newConfig)

      return newConfig
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      console.error('Failed to fetch config:', apiError)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [cacheMaxAge])

  /**
   * Refresh configuration (bypass cache)
   */
  const refreshConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const newConfig = await chatService.getConfig()
      setConfig(newConfig)
      storageService.setCachedConfig(newConfig)
      return newConfig
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      console.error('Failed to refresh config:', apiError)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Load config on mount
   */
  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return {
    config,
    isLoading,
    error,
    fetchConfig,
    refreshConfig,
    isReady: config !== null && !isLoading,
  }
}

export default useConfig
