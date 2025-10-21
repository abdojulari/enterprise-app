import { defineStore } from 'pinia'
import type { User, UserRole, UserStatus } from '~/types'

interface UserManagementState {
  users: User[]
  loading: boolean
  search: string
  filters: {
    role: UserRole | null
    status: UserStatus | null
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
  selectedUsers: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserManagementState => ({
    users: [],
    loading: false,
    search: '',
    filters: {
      role: null,
      status: null,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
    selectedUsers: [],
  }),

  getters: {
    filteredUsers: (state) => {
      let filtered = [...state.users]
      
      // Apply search filter
      if (state.search) {
        const search = state.search.toLowerCase()
        filtered = filtered.filter(user =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        )
      }
      
      // Apply role filter
      if (state.filters.role) {
        filtered = filtered.filter(user => user.role === state.filters.role)
      }
      
      // Apply status filter
      if (state.filters.status) {
        filtered = filtered.filter(user => user.status === state.filters.status)
      }
      
      return filtered
    },

    paginatedUsers: (state) => {
      const filtered = state.filteredUsers
      const start = (state.pagination.page - 1) * state.pagination.limit
      const end = start + state.pagination.limit
      return filtered.slice(start, end)
    },

    totalPages: (state) => {
      return Math.ceil(state.filteredUsers.length / state.pagination.limit)
    },

    selectedUserCount: (state) => state.selectedUsers.length,

    hasSelection: (state) => state.selectedUsers.length > 0,

    // User statistics
    userStats: (state) => {
      const total = state.users.length
      const active = state.users.filter(u => u.status === UserStatus.ACTIVE).length
      const inactive = state.users.filter(u => u.status === UserStatus.INACTIVE).length
      const pending = state.users.filter(u => u.status === UserStatus.PENDING).length
      const suspended = state.users.filter(u => u.status === UserStatus.SUSPENDED).length
      
      return {
        total,
        active,
        inactive,
        pending,
        suspended,
        activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
      }
    },

    roleDistribution: (state) => {
      const roles = state.users.reduce((acc, user) => {
        const role = user.role || 'unknown'
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return roles
    }
  },

  actions: {
    // Load users with optional filters
    async loadUsers(refresh = false) {
      if (this.loading && !refresh) return
      
      this.loading = true
      
      try {
        const { get } = useApi()
        const response = await get('/users', {
          page: this.pagination.page,
          limit: this.pagination.limit,
          search: this.search,
          role: this.filters.role,
          status: this.filters.status
        })
        
        this.users = response.data?.users || []
        this.pagination.total = response.data?.total || 0
        
      } catch (error) {
        console.error('Error loading users:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Loading Users')
        this.users = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },

    // Create new user
    async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
      try {
        const uiStore = useUIStore()
        uiStore.showLoading('Creating user...')
        
        const { post } = useApi()
        const response = await post('/users', userData)
        
        if (response.data) {
          this.users.unshift(response.data)
          this.pagination.total++
          
          const notificationStore = useNotificationStore()
          notificationStore.success('User Created', `${response.data.name} has been added to the system`)
          
          return response.data
        }
        
      } catch (error) {
        console.error('Error creating user:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Creating User')
        throw error
      } finally {
        const uiStore = useUIStore()
        uiStore.hideLoading()
      }
    },

    // Update user
    async updateUser(userId: string, updates: Partial<User>) {
      try {
        const uiStore = useUIStore()
        uiStore.showLoading('Updating user...')
        
        const { put } = useApi()
        const response = await put(`/users/${userId}`, updates)
        
        if (response.data) {
          const userIndex = this.users.findIndex(u => u.id === userId)
          if (userIndex !== -1) {
            this.users[userIndex] = response.data
          }
          
          const notificationStore = useNotificationStore()
          notificationStore.success('User Updated', 'User information has been saved')
          
          return response.data
        }
        
      } catch (error) {
        console.error('Error updating user:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Updating User')
        throw error
      } finally {
        const uiStore = useUIStore()
        uiStore.hideLoading()
      }
    },

    // Delete user
    async deleteUser(userId: string) {
      try {
        const user = this.users.find(u => u.id === userId)
        if (!user) {
          throw new Error('User not found')
        }
        
        const uiStore = useUIStore()
        uiStore.showLoading('Deleting user...')
        
        const { del } = useApi()
        await del(`/users/${userId}`)
        
        this.users = this.users.filter(u => u.id !== userId)
        this.selectedUsers = this.selectedUsers.filter(id => id !== userId)
        this.pagination.total--
        
        const notificationStore = useNotificationStore()
        notificationStore.success('User Deleted', `${user.name} has been removed from the system`)
        
      } catch (error) {
        console.error('Error deleting user:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Deleting User')
        throw error
      } finally {
        const uiStore = useUIStore()
        uiStore.hideLoading()
      }
    },

    // Bulk operations
    async bulkDelete(userIds: string[]) {
      try {
        const uiStore = useUIStore()
        uiStore.showLoading(`Deleting ${userIds.length} users...`)
        
        const { post } = useApi()
        await post('/users/bulk-delete', { userIds })
        
        this.users = this.users.filter(u => !userIds.includes(u.id))
        this.selectedUsers = []
        this.pagination.total -= userIds.length
        
        const notificationStore = useNotificationStore()
        notificationStore.success('Users Deleted', `${userIds.length} users have been removed`)
        
      } catch (error) {
        console.error('Error bulk deleting users:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Bulk Delete')
        throw error
      } finally {
        const uiStore = useUIStore()
        uiStore.hideLoading()
      }
    },

    async bulkUpdateStatus(userIds: string[], status: UserStatus) {
      try {
        const uiStore = useUIStore()
        uiStore.showLoading(`Updating ${userIds.length} users...`)
        
        const { post } = useApi()
        await post('/users/bulk-update-status', { userIds, status })
        
        this.users.forEach(user => {
          if (userIds.includes(user.id)) {
            user.status = status
            user.updatedAt = new Date().toISOString()
          }
        })
        
        this.selectedUsers = []
        
        const notificationStore = useNotificationStore()
        notificationStore.success('Users Updated', `${userIds.length} users status changed to ${status}`)
        
      } catch (error) {
        console.error('Error bulk updating users:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Bulk Update')
        throw error
      } finally {
        const uiStore = useUIStore()
        uiStore.hideLoading()
      }
    },

    // Filters and search
    setSearch(search: string) {
      this.search = search
      this.pagination.page = 1
    },

    setRoleFilter(role: UserRole | null) {
      this.filters.role = role
      this.pagination.page = 1
    },

    setStatusFilter(status: UserStatus | null) {
      this.filters.status = status
      this.pagination.page = 1
    },

    clearFilters() {
      this.search = ''
      this.filters.role = null
      this.filters.status = null
      this.pagination.page = 1
    },

    // Pagination
    setPage(page: number) {
      this.pagination.page = page
    },

    setLimit(limit: number) {
      this.pagination.limit = limit
      this.pagination.page = 1
    },

    // Selection
    selectUser(userId: string) {
      if (!this.selectedUsers.includes(userId)) {
        this.selectedUsers.push(userId)
      }
    },

    deselectUser(userId: string) {
      this.selectedUsers = this.selectedUsers.filter(id => id !== userId)
    },

    toggleUserSelection(userId: string) {
      if (this.selectedUsers.includes(userId)) {
        this.deselectUser(userId)
      } else {
        this.selectUser(userId)
      }
    },

    selectAll() {
      this.selectedUsers = this.filteredUsers.map(user => user.id)
    },

    deselectAll() {
      this.selectedUsers = []
    },

    toggleAllSelection() {
      if (this.selectedUsers.length === this.filteredUsers.length) {
        this.deselectAll()
      } else {
        this.selectAll()
      }
    },

    // Get user by ID
    getUserById(id: string): User | undefined {
      return this.users.find(user => user.id === id)
    }
  }
})
