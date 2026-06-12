/**
 * Validation Types
 *
 * Type definitions for form validation and data validation
 */

/**
 * Validation result
 *
 * Result of validating a single field
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

/**
 * Form validation errors
 *
 * Validation errors for multiple fields
 */
export interface FormValidationErrors {
  [field: string]: ValidationResult | undefined
}

/**
 * Input validation rule
 *
 * A single validation rule for input
 */
export interface ValidationRule {
  type:
    | 'required'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'custom'
    | 'min'
    | 'max'
  value?: unknown
  message?: string
  validate?: (value: unknown) => boolean
}

/**
 * Validation schema for a form
 *
 * Complete validation schema for a form
 */
export interface ValidationSchema {
  [field: string]: ValidationRule[]
}

/**
 * Message validation
 *
 * Validation errors and warnings for a chat message
 */
export interface MessageValidation extends ValidationResult {
  length?: number
  isEmpty?: boolean
  isWhitespaceOnly?: boolean
  excedsMaxLength?: boolean
  belowMinLength?: boolean
}

/**
 * Chat request validation
 *
 * Validation for a chat request
 */
export interface ChatRequestValidation {
  message: MessageValidation
  role: ValidationResult
  temperature?: ValidationResult
  max_tokens?: ValidationResult
  isValid: boolean
}

/**
 * Validation context
 *
 * Context for validation operations
 */
export interface ValidationContext {
  minMessageLength: number
  maxMessageLength: number
  minTemperature: number
  maxTemperature: number
  minTokens: number
  maxTokens: number
}

/**
 * Validate message input
 */
export function validateMessage(
  message: string,
  context: Partial<ValidationContext> = {}
): MessageValidation {
  const {
    minMessageLength = 1,
    maxMessageLength = 5000,
  } = context

  const isEmpty = message.length === 0
  const isWhitespaceOnly = message.trim().length === 0
  const belowMinLength = message.length < minMessageLength
  const excedsMaxLength = message.length > maxMessageLength

  const isValid =
    !isEmpty && !isWhitespaceOnly && !belowMinLength && !excedsMaxLength

  return {
    valid: isValid,
    isEmpty,
    isWhitespaceOnly,
    belowMinLength,
    excedsMaxLength,
    length: message.length,
    error: isWhitespaceOnly
      ? 'Message cannot be empty or whitespace only'
      : belowMinLength
        ? `Message must be at least ${minMessageLength} character`
        : excedsMaxLength
          ? `Message cannot exceed ${maxMessageLength} characters`
          : undefined,
  }
}

/**
 * Validate temperature value
 */
export function validateTemperature(
  temperature: number,
  context: Partial<ValidationContext> = {}
): ValidationResult {
  const {
    minTemperature = 0.0,
    maxTemperature = 2.0,
  } = context

  const valid = temperature >= minTemperature && temperature <= maxTemperature

  return {
    valid,
    error: valid
      ? undefined
      : `Temperature must be between ${minTemperature} and ${maxTemperature}`,
  }
}

/**
 * Validate max tokens
 */
export function validateMaxTokens(
  maxTokens: number,
  context: Partial<ValidationContext> = {}
): ValidationResult {
  const { minTokens = 100, maxTokens: max = 4000 } = context

  const valid = maxTokens >= minTokens && maxTokens <= max

  return {
    valid,
    error: valid
      ? undefined
      : `Max tokens must be between ${minTokens} and ${max}`,
  }
}
