/**
 * useToast Hook
 *
 * Custom hook for displaying toast notifications (shadcn/ui based).
 */

import { useState, useCallback, useMemo } from 'react'
import { generateId } from '../lib/utils'

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'default' | 'destructive' | 'success'
}

export interface ToastActionElement {
  altText: string
  action: React.ReactNode
}

interface ToastOptions {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive' | 'success'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Core toast function - stable across renders
  const addToast = useCallback((props: ToastOptions) => {
    const id = generateId()

    const newToast: Toast = {
      id,
      ...props,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      },
    }

    setToasts((prev) => [newToast, ...prev])

    return {
      id,
      dismiss: () =>
        setToasts((prev) => prev.filter((t) => t.id !== id)),
    }
  }, [])

  // Memoize toast methods object to prevent recreating it on every render
  const toast = useMemo(
    () => ({
      success: (options: ToastOptions) =>
        addToast({ ...options, variant: 'success' }),
      error: (options: ToastOptions) =>
        addToast({ ...options, variant: 'destructive' }),
      warning: (options: ToastOptions) =>
        addToast({ ...options, variant: 'default' }),
      default: (options: ToastOptions) =>
        addToast({ ...options, variant: 'default' }),
    }),
    [addToast]
  )

  // Dismiss function - stable across renders
  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
    } else {
      setToasts([])
    }
  }, [])

  return {
    toasts,
    toast,
    dismiss,
  }
}
