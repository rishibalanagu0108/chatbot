/**
 * Toast Context
 *
 * Global context for managing toast notifications.
 */

import { createContext, useState, useCallback } from 'react'
import type { Notification, NotificationContextType } from '@/types'
import { generateId } from '@/lib/utils'

export const ToastContext = createContext<NotificationContextType | undefined>(
  undefined
)

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = generateId()
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 5000,
      }

      setNotifications((prev) => [...prev, newNotification])
      return id
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  }

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  )
}
