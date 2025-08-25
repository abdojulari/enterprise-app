import { defineStore } from 'pinia'
import type { Notification, NotificationAction } from '~/types'

interface NotificationState {
  notifications: Notification[]
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
  }),

  getters: {
    activeNotifications: (state) => state.notifications,
    notificationCount: (state) => state.notifications.length,
    errorNotifications: (state) => state.notifications.filter(n => n.type === 'error'),
  },

  actions: {
    add(notification: Omit<Notification, 'id'>): string {
      const id = Date.now().toString()
      const newNotification: Notification = {
        id,
        timeout: 5000, // Default timeout
        ...notification,
      }
      
      this.notifications.push(newNotification)
      
      // Auto remove after timeout
      if (newNotification.timeout && newNotification.timeout > 0) {
        setTimeout(() => {
          this.remove(id)
        }, newNotification.timeout)
      }
      
      return id
    },

    remove(id: string) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    clear() {
      this.notifications = []
    },

    // Convenience methods for different notification types
    success(title: string, message?: string, options?: Partial<Notification>): string {
      return this.add({
        type: 'success',
        title,
        message,
        ...options,
      })
    },

    error(title: string, message?: string, options?: Partial<Notification>): string {
      return this.add({
        type: 'error',
        title,
        message,
        timeout: 0, // Don't auto-dismiss errors
        ...options,
      })
    },

    warning(title: string, message?: string, options?: Partial<Notification>): string {
      return this.add({
        type: 'warning',
        title,
        message,
        ...options,
      })
    },

    info(title: string, message?: string, options?: Partial<Notification>): string {
      return this.add({
        type: 'info',
        title,
        message,
        ...options,
      })
    },

    // Handle API errors
    handleApiError(error: any, context?: string): string {
      let title = 'Error'
      let message = 'An unexpected error occurred'
      
      if (context) {
        title = `${context} Error`
      }
      
      if (error?.data?.message) {
        message = error.data.message
      } else if (error?.message) {
        message = error.message
      } else if (typeof error === 'string') {
        message = error
      }
      
      return this.add({
        type: 'error',
        title,
        message,
        timeout: 0,
      })
    },

    // Handle form validation errors
    handleValidationErrors(errors: Record<string, string[]>) {
      Object.entries(errors).forEach(([field, fieldErrors]) => {
        fieldErrors.forEach(errorMessage => {
          this.add({
            type: 'error',
            title: 'Validation Error',
            message: `${field}: ${errorMessage}`,
            timeout: 8000,
          })
        })
      })
    },

    // Batch operations
    addMultiple(notifications: Omit<Notification, 'id'>[]): string[] {
      return notifications.map(notification => this.add(notification))
    },

    removeMultiple(ids: string[]) {
      ids.forEach(id => this.remove(id))
    },

    // Filter operations
    clearByType(type: Notification['type']) {
      this.notifications = this.notifications.filter(n => n.type !== type)
    },

    // Get notifications by type
    getByType(type: Notification['type']) {
      return this.notifications.filter(n => n.type === type)
    }
  }
})
