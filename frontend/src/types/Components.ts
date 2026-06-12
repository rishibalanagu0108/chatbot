/**
 * Component Props Types
 *
 * Type definitions for React component props
 */

import type { ReactNode } from 'react'
import type { Message, FormattedBlock } from './Message'
import type { ChatConfig, UserSettings, LLMRole, TemperaturePreset } from './ChatConfig'

/**
 * Common component props
 *
 * Props shared across multiple components
 */
export interface CommonComponentProps {
  className?: string
  disabled?: boolean
  loading?: boolean
  error?: string | null
}

/**
 * Chat message component props
 */
export interface ChatMessageProps extends CommonComponentProps {
  message: Message
  showTimestamp?: boolean
  showMetadata?: boolean
}

/**
 * Chat input component props
 */
export interface ChatInputProps extends CommonComponentProps {
  placeholder?: string
  maxLength?: number
  minLength?: number
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (message: string) => void | Promise<void>
  showCharCount?: boolean
  showSendButton?: boolean
}

/**
 * Settings panel props
 */
export interface SettingsPanelProps extends CommonComponentProps {
  config: ChatConfig | null
  settings: UserSettings
  onSettingsChange?: (settings: Partial<UserSettings>) => void
  onClose?: () => void
}

/**
 * Role selector props
 */
export interface RoleSelectorProps {
  value: LLMRole
  options: Array<{ name: LLMRole; description: string }>
  onChange?: (role: LLMRole) => void
  disabled?: boolean
}

/**
 * Temperature control props
 */
export interface TemperatureControlProps {
  value?: number
  preset?: TemperaturePreset
  presets?: Record<TemperaturePreset, number>
  minTemp?: number
  maxTemp?: number
  onChange?: (temp: number) => void
  onPresetChange?: (preset: TemperaturePreset) => void
  disabled?: boolean
}

/**
 * Markdown renderer component props
 */
export interface MarkdownRendererProps extends CommonComponentProps {
  blocks: FormattedBlock[]
  metadata?: {
    has_code?: boolean
    code_languages?: string[]
    has_markdown?: boolean
  }
}

/**
 * Code block component props
 */
export interface CodeBlockProps extends CommonComponentProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  showCopyButton?: boolean
  onCopy?: (code: string) => void
}

/**
 * Loading spinner props
 */
export interface LoadingSpinnerProps extends CommonComponentProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

/**
 * Error message component props
 */
export interface ErrorMessageProps extends CommonComponentProps {
  error: string | Error
  title?: string
  onDismiss?: () => void
  retry?: () => void | Promise<void>
  isRetrying?: boolean
}

/**
 * Modal/Dialog component props
 */
export interface DialogProps {
  isOpen: boolean
  title: string
  description?: string
  onClose?: () => void
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  isDangerous?: boolean
}

/**
 * Button component props
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  children: ReactNode
}

/**
 * Header component props
 */
export interface HeaderProps extends CommonComponentProps {
  title?: string
  subtitle?: string
  onThemeToggle?: () => void
  currentTheme?: 'light' | 'dark'
  showSettings?: boolean
  onSettingsClick?: () => void
}

/**
 * Messages container component props
 */
export interface MessagesContainerProps extends CommonComponentProps {
  messages: Message[]
  isLoading?: boolean
  emptyMessage?: string
  onMessageRetry?: (messageId: string) => void
}

/**
 * Settings menu props
 */
export interface SettingsMenuProps {
  config: ChatConfig | null
  settings: UserSettings
  onSettingsChange?: (settings: Partial<UserSettings>) => void
  onClose?: () => void
}
