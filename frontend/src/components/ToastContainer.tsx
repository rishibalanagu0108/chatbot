/**
 * ToastContainer Component
 *
 * Container for displaying all active toasts.
 */

import type { Notification } from '@/types'
import { Toast } from './Toast'

interface ToastContainerProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function ToastContainer({
  notifications,
  onRemove,
}: ToastContainerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Toast area - bottom right */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 max-w-sm pointer-events-auto">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onClose={onRemove}
          />
        ))}
      </div>
    </div>
  )
}
