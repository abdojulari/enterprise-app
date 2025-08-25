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
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 600))
        
        const mockUsers: User[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@enterprise.com',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            avatar: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@enterprise.com',
            role: UserRole.MANAGER,
            status: UserStatus.ACTIVE,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-14T00:00:00Z'
          },
          {
            id: '3',
            name: 'Bob Wilson',
            email: 'bob.wilson@enterprise.com',
            role: UserRole.USER,
            status: UserStatus.PENDING,
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-13T00:00:00Z'
          },
          {
            id: '4',
            name: 'Alice Johnson',
            email: 'alice.johnson@enterprise.com',
            role: UserRole.MODERATOR,
            status: UserStatus.ACTIVE,
            createdAt: '2024-01-04T00:00:00Z',
            updatedAt: '2024-01-12T00:00:00Z'
          },
          {
            id: '5',
            name: 'Charlie Brown',
            email: 'charlie.brown@enterprise.com',
            role: UserRole.USER,
            status: UserStatus.SUSPENDED,
            createdAt: '2024-01-05T00:00:00Z',
            updatedAt: '2024-01-11T00:00:00Z'
          }
        ]
        
        this.users = mockUsers
        this.pagination.total = mockUsers.length
        
        // TODO: Replace with actual API call
        // const { get } = useApi()
        // const response = await get('/users', {
        //   page: this.pagination.page,
        //   limit: this.pagination.limit,
        //   search: this.search,
        //   role: this.filters.role,
        //   status: this.filters.status
        // })
        // this.users = response.data.users
        // this.pagination.total = response.data.total
        
      } catch (error) {
        console.error('Error loading users:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Loading Users')
      } finally {
        this.loading = false
      }
    },

    // Create new user
    async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
      try {
        const uiStore = useUIStore()
        uiStore.showLoading('Creating user...')
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        this.users.unshift(newUser)
        this.pagination.total++
        
        const notificationStore = useNotificationStore()
        notificationStore.success('User Created', `${newUser.name} has been added to the system`)
        
        return newUser
        
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
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const userIndex = this.users.findIndex(u => u.id === userId)
        if (userIndex === -1) {
          throw new Error('User not found')
        }
        
        this.users[userIndex] = {
          ...this.users[userIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        
        const notificationStore = useNotificationStore()
        notificationStore.success('User Updated', 'User information has been saved')
        
        return this.users[userIndex]
        
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
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 600))
        
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
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
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
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800))
        
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
