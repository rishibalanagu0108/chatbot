/**
 * useToast Hook
 *
 * Custom hook for displaying toast notifications.
 */

import { useContext } from 'react'
import { ToastContext } from '@/context/ToastContext'
import type { NotificationType } from '@/types'

interface ToastOptions {
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  const {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  } = context

  const showToast = (
    type: NotificationType,
    options: ToastOptions
  ): string => {
    return addNotification({
      type,
      ...options,
    })
  }

  return {
    notifications,
    toast: {
      success: (options: ToastOptions) => showToast('success', options),
      error: (options: ToastOptions) => showToast('error', options),
      warning: (options: ToastOptions) => showToast('warning', options),
      info: (options: ToastOptions) => showToast('info', options),
    },
    removeNotification,
    clearAll,
  }
}
