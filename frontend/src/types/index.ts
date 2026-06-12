/**
 * Type Exports
 *
 * Central export point for all TypeScript types
 */

// Message types
export type { Message, MessageSender, MessageStatus, MessageMetadata } from './Message'
export type { FormattedBlock, BlockType, ResponseMetadata } from './Message'
export { isChatResponse, isErrorMessage } from './Message'
export type { ChatResponse, ErrorMessage } from './Message'

// Chat configuration types
export type {
  ChatConfig,
  LLMRole,
  TemperaturePreset,
  RoleInfo,
  UserSettings,
} from './ChatConfig'
export { DEFAULT_SETTINGS } from './ChatConfig'

// API types
export type {
  ChatRequestPayload,
  ChatApiResponse,
  ConfigApiResponse,
  HealthResponse,
  ApiError,
  ApiRequestOptions,
  ApiResponseWrapper,
} from './API'
export { isApiError, isChatApiResponse } from './API'

// Component props types
export type {
  CommonComponentProps,
  ChatMessageProps,
  ChatInputProps,
  SettingsPanelProps,
  RoleSelectorProps,
  TemperatureControlProps,
  MarkdownRendererProps,
  CodeBlockProps,
  LoadingSpinnerProps,
  ErrorMessageProps,
  DialogProps,
  ButtonProps,
  HeaderProps,
  MessagesContainerProps,
  SettingsMenuProps,
} from './Components'

// Validation types
export type {
  ValidationResult,
  FormValidationErrors,
  ValidationRule,
  ValidationSchema,
  MessageValidation,
  ChatRequestValidation,
  ValidationContext,
} from './Validation'
export {
  validateMessage,
  validateTemperature,
  validateMaxTokens,
} from './Validation'

// State management types
export type {
  ChatState,
  ChatAction,
  UIState,
  UIAction,
  Notification,
  AppState,
  AsyncOperationState,
  AsyncThunkAction,
  ChatStatistics,
} from './State'
export { calculateChatStatistics } from './State'
