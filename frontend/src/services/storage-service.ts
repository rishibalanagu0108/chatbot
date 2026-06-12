/**
 * Storage Service
 *
 * Service for managing browser local storage.
 * Provides type-safe methods for persisting and retrieving data.
 */

/**
 * Storage keys
 *
 * Enumeration of all storage keys used in the app
 */
export const STORAGE_KEYS = {
  // User settings
  THEME: 'app:theme',
  USER_SETTINGS: 'app:user-settings',

  // Chat data
  CHAT_MESSAGES: 'chat:messages',
  CHAT_HISTORY: 'chat:history',

  // Cache
  CONFIG_CACHE: 'cache:config',
  CONFIG_CACHE_TIME: 'cache:config-time',
} as const

/**
 * Storage Service Class
 *
 * Type-safe wrapper around localStorage
 */
export class StorageService {
  /**
   * Set a value in storage
   */
  set<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value)
      localStorage.setItem(key, json)
    } catch (error) {
      console.error(`Failed to store ${key}:`, error)
    }
  }

  /**
   * Get a value from storage
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue || null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error)
      return defaultValue || null
    }
  }

  /**
   * Remove a value from storage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error)
    }
  }

  /**
   * Clear all storage
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  /**
   * Check if a key exists in storage
   */
  exists(key: string): boolean {
    return localStorage.getItem(key) !== null
  }

  /**
   * Get all keys in storage
   */
  keys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.push(key)
    }
    return keys
  }

  /**
   * Get all items with a specific prefix
   */
  getByPrefix<T>(prefix: string): Record<string, T> {
    const result: Record<string, T> = {}
    const keys = this.keys()

    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        const value = this.get<T>(key)
        if (value !== null) {
          result[key] = value
        }
      }
    })

    return result
  }

  /**
   * Clear all items with a specific prefix
   */
  clearByPrefix(prefix: string): void {
    const keys = this.keys()
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        this.remove(key)
      }
    })
  }

  /**
   * Get theme preference
   */
  getTheme(): 'light' | 'dark' {
    const theme = this.get<string>(STORAGE_KEYS.THEME, 'light')
    return (theme === 'light' || theme === 'dark' ? theme : 'light') as
      | 'light'
      | 'dark'
  }

  /**
   * Set theme preference
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.set(STORAGE_KEYS.THEME, theme)
  }

  /**
   * Get user settings
   */
  getUserSettings<T>(defaultValue?: T): T | null {
    return this.get<T>(STORAGE_KEYS.USER_SETTINGS, defaultValue)
  }

  /**
   * Set user settings
   */
  setUserSettings<T>(settings: T): void {
    this.set(STORAGE_KEYS.USER_SETTINGS, settings)
  }

  /**
   * Get cached config (with TTL check)
   */
  getCachedConfig<T>(maxAge = 3600000): T | null {
    // maxAge in milliseconds, default 1 hour
    const config = this.get<T>(STORAGE_KEYS.CONFIG_CACHE)
    const timestamp = this.get<number>(STORAGE_KEYS.CONFIG_CACHE_TIME, 0)

    if (!config || !timestamp) return null

    const age = Date.now() - timestamp
    if (age > maxAge) {
      this.remove(STORAGE_KEYS.CONFIG_CACHE)
      this.remove(STORAGE_KEYS.CONFIG_CACHE_TIME)
      return null
    }

    return config
  }

  /**
   * Set cached config
   */
  setCachedConfig<T>(config: T): void {
    this.set(STORAGE_KEYS.CONFIG_CACHE, config)
    this.set(STORAGE_KEYS.CONFIG_CACHE_TIME, Date.now())
  }

  /**
   * Get messages from cache
   */
  getChatMessages<T>(defaultValue?: T[]): T[] {
    return this.get<T[]>(STORAGE_KEYS.CHAT_MESSAGES, defaultValue || []) || []
  }

  /**
   * Save messages to cache
   */
  saveChatMessages<T>(messages: T[]): void {
    this.set(STORAGE_KEYS.CHAT_MESSAGES, messages)
  }

  /**
   * Clear chat messages
   */
  clearChatMessages(): void {
    this.remove(STORAGE_KEYS.CHAT_MESSAGES)
  }
}

/**
 * Global storage service instance
 */
export const storageService = new StorageService()

export default storageService
