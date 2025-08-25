import { defineStore } from 'pinia'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string
  timeout?: number
}

interface NotificationState {
  notifications: Notification[]
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: []
  }),

  getters: {
    notificationCount: (state) => state.notifications.length
  },

  actions: {
    show({ type, message, details, timeout = 3000 }: Omit<Notification, 'id'>) {
      const id = Math.random().toString(36).substring(7)
      const notification = { id, type, message, details, timeout }
      
      this.notifications.push(notification)

      if (timeout > 0) {
        setTimeout(() => {
          this.remove(id)
        }, timeout)
      }
    },

    success(message: string, details?: string) {
      this.show({ type: 'success', message, details })
    },

    error(message: string, details?: string) {
      this.show({ type: 'error', message, details })
    },

    warning(message: string, details?: string) {
      this.show({ type: 'warning', message, details })
    },

    info(message: string, details?: string) {
      this.show({ type: 'info', message, details })
    },

    remove(id: string) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    clear() {
      this.notifications = []
    }
  }
})