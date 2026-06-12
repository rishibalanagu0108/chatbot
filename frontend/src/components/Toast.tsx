/**
 * Toast Component
 *
 * Individual toast notification.
 */

import { useEffect, useState } from 'react'
import type { Notification } from '@/types'
import { cn } from '@/lib/utils'

interface ToastProps {
  notification: Notification
  onClose: (id: string) => void
}

export function Toast({ notification, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  // Auto-dismiss after duration
  useEffect(() => {
    if (!notification.duration) return

    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(notification.id), 300)
    }, notification.duration)

    return () => clearTimeout(timer)
  }, [notification.duration, notification.id, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(notification.id), 300)
  }

  // Get styles based on type
  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-500/90',
          border: 'border-green-600',
          icon: '✓',
          iconBg: 'bg-green-600',
        }
      case 'error':
        return {
          bg: 'bg-red-500/90',
          border: 'border-red-600',
          icon: '✕',
          iconBg: 'bg-red-600',
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500/90',
          border: 'border-yellow-600',
          icon: '⚠',
          iconBg: 'bg-yellow-600',
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/90',
          border: 'border-blue-600',
          icon: 'ℹ',
          iconBg: 'bg-blue-600',
        }
    }
  }

  const styles = getStyles()

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 max-w-sm rounded-lg border backdrop-blur-sm transition-all duration-300',
        styles.bg,
        styles.border,
        'text-white shadow-lg',
        isExiting && 'translate-y-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={cn(
            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold',
            styles.iconBg
          )}
        >
          {styles.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight">
            {notification.title}
          </h3>
          {notification.message && (
            <p className="text-xs text-white/80 mt-1 leading-relaxed">
              {notification.message}
            </p>
          )}

          {/* Action Button */}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs font-medium underline hover:opacity-80 transition-opacity"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
