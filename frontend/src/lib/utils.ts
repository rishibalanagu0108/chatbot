/**
 * Utility Functions
 *
 * Common helper functions used throughout the app
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conflict resolution properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

/**
 * Get formatted timestamp for display
 */
export function getTimestamp(): string {
  const now = new Date()
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Get formatted date for display
 */
export function getFormattedDate(date?: Date): string {
  const d = date || new Date()
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Check if text contains code blocks
 */
export function hasCodeBlocks(text: string): boolean {
  return /```[\s\S]*?```/.test(text)
}

/**
 * Extract code language from code block
 */
export function extractCodeLanguage(codeBlock: string): string {
  const match = codeBlock.match(/^```(\w+)/)
  return match ? match[1] : 'plaintext'
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout>

  return function (...args: unknown[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Detect if text contains markdown syntax
 */
export function isMarkdown(text: string): boolean {
  return /[*_`[\]()#-]|```[\s\S]*?```|> |^\s*[-*+]\s|\|\s*-+\s*\|/m.test(text)
}

/**
 * Get language name from code block language identifier
 */
export function getLanguageName(language: string): string {
  const names: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    py: 'Python',
    java: 'Java',
    cpp: 'C++',
    cs: 'C#',
    php: 'PHP',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    swift: 'Swift',
    kt: 'Kotlin',
    html: 'HTML',
    css: 'CSS',
    sql: 'SQL',
    bash: 'Bash',
    sh: 'Shell',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    md: 'Markdown',
    xml: 'XML',
  }
  return names[language?.toLowerCase() || 'plaintext'] || language || 'Code'
}
