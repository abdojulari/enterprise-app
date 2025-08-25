import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      avatar: undefined
    },
    token: null,
    isAuthenticated: true // For demo purposes
  }),

  getters: {
    currentUser: (state) => state.user,
    userInitials: (state) => {
      if (!state.user?.name) return ''
      return state.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    }
  },

  actions: {
    async login(email: string, password: string) {
      try {
        // TODO: Implement actual login
        this.isAuthenticated = true
        this.user = {
          id: '1',
          name: 'John Doe',
          email: email,
          role: 'admin'
        }
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async logout() {
      try {
        // TODO: Implement actual logout
        this.user = null
        this.token = null
        this.isAuthenticated = false
        return true
      } catch (error) {
        console.error('Logout failed:', error)
        return false
      }
    },

    async checkAuth() {
      try {
        // TODO: Implement actual auth check
        return this.isAuthenticated
      } catch (error) {
        console.error('Auth check failed:', error)
        return false
      }
    }
  }
})
