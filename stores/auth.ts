import { defineStore } from 'pinia'
import type { User, LoginCredentials, RegisterData, AuthToken } from '~/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    userInitials: (state) => {
      if (!state.user?.name) return 'G'
      return state.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    hasRole: (state) => {
      return (roles: string | string[]) => {
        if (!state.user?.role) return false
        
        const userRole = state.user.role
        if (typeof roles === 'string') {
          return userRole === roles
        }
        
        return roles.includes(userRole)
      }
    },
  },

  actions: {
    async initAuth() {
      if (process.client) {
        const storedToken = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('auth_user')
        
        if (storedToken && storedUser) {
          this.token = storedToken
          this.user = JSON.parse(storedUser)
          this.isAuthenticated = true
          
          // Verify token validity
          try {
            await this.getCurrentUser()
          } catch (error) {
            await this.logout()
          }
        }
      }
    },

    async login(credentials: LoginCredentials) {
      this.loading = true
      this.error = null
      
      try {
        const { post } = useApi()
        const response = await post<{ user: User; token: AuthToken }>('/auth/login', credentials)
        
        if (response.success && response.data) {
          this.user = response.data.user
          this.token = response.data.token.accessToken
          this.isAuthenticated = true
          
          // Store in localStorage
          if (process.client) {
            localStorage.setItem('auth_token', response.data.token.accessToken)
            localStorage.setItem('auth_user', JSON.stringify(response.data.user))
          }
          
          return response
        }
        
        throw new Error(response.message || 'Login failed')
      } catch (error: any) {
        this.error = error.message || 'Login failed'
        console.error('Login error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(data: RegisterData) {
      this.loading = true
      this.error = null
      
      try {
        const { post } = useApi()
        const response = await post<{ user: User; token: AuthToken }>('/auth/register', data)
        
        if (response.success && response.data) {
          this.user = response.data.user
          this.token = response.data.token.accessToken
          this.isAuthenticated = true
          
          // Store in localStorage
          if (process.client) {
            localStorage.setItem('auth_token', response.data.token.accessToken)
            localStorage.setItem('auth_user', JSON.stringify(response.data.user))
          }
          
          return response
        }
        
        throw new Error(response.message || 'Registration failed')
      } catch (error: any) {
        this.error = error.message || 'Registration failed'
        console.error('Registration error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async getCurrentUser() {
      if (!this.token) return null
      
      try {
        const { get } = useApi()
        const response = await get<User>('/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        if (response.success && response.data) {
          this.user = response.data
          
          if (process.client) {
            localStorage.setItem('auth_user', JSON.stringify(response.data))
          }
          
          return response.data
        }
        
        return null
      } catch (error) {
        console.error('Get current user error:', error)
        throw error
      }
    },

    async logout() {
      this.loading = true
      
      try {
        // Call logout endpoint if token exists
        if (this.token) {
          const { post } = useApi()
          await post('/auth/logout', {}, {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          })
        }
      } catch (error) {
        console.error('Logout API error:', error)
        // Continue with local logout even if API call fails
      }
      
      // Clear state
      this.$reset()
      
      // Clear localStorage
      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
      
      this.loading = false
      
      // Redirect to login
      await navigateTo('/auth/login')
    },

    async forgotPassword(email: string) {
      this.loading = true
      this.error = null

      try {
        // Call forgot password API
        const { post } = useApi()
        const response = await post<{ message: string }>('/auth/forgot-password', { 
          email 
        })
        
        // For now, simulate with mock response
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        return { message: 'Reset link sent to your email' }
        
      } catch (err: any) {
        this.error = err.message || 'Failed to send reset link'
        throw err
      } finally {
        this.loading = false
      }
    },

    async refreshToken() {
      if (!this.token) return false
      
      try {
        const { post } = useApi()
        const response = await post<{ token: AuthToken }>('/auth/refresh', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        if (response.success && response.data) {
          this.token = response.data.token.accessToken
          
          if (process.client) {
            localStorage.setItem('auth_token', response.data.token.accessToken)
          }
          
          return true
        }
        
        return false
      } catch (error) {
        console.error('Token refresh error:', error)
        await this.logout()
        return false
      }
    },

    clearError() {
      this.error = null
    }
  },

  // Note: Persistence will be handled by the client plugin
})
