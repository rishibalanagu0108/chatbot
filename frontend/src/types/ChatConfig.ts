/**
 * Chat Configuration Types
 *
 * Defines types for chat settings and configuration
 */

export type LLMRole = 'assistant' | 'coder' | 'tutor' | 'creative'
export type TemperaturePreset = 'precise' | 'balanced' | 'creative'

export interface RoleInfo {
  name: LLMRole
  description: string
}

export interface ChatConfig {
  roles: RoleInfo[]
  temperature_presets: Record<TemperaturePreset, number>
  default_temperature: number
  default_max_tokens: number
  min_message_length: number
  max_message_length: number
  min_temperature: number
  max_temperature: number
  api_version: string
}

export interface UserSettings {
  role: LLMRole
  temperature?: number
  temperature_preset?: TemperaturePreset
  max_tokens?: number
  theme: 'light' | 'dark'
}

export const DEFAULT_SETTINGS: UserSettings = {
  role: 'assistant',
  temperature_preset: 'balanced',
  theme: 'light',
}
