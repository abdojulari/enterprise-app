import { defineStore } from 'pinia'
import type { DashboardCard, ChartData } from '~/types'

interface DashboardState {
  // Stats cards
  statsCards: DashboardCard[]
  statsLoading: boolean
  
  // Charts data
  revenueChartData: ChartData | null
  userGrowthData: ChartData | null
  chartsLoading: boolean
  
  // Activity feed
  recentActivities: any[]
  activitiesLoading: boolean
  
  // Table data
  tableData: any[]
  tableLoading: boolean
  tableSearch: string
  tablePage: number
  tableItemsPerPage: number
  
  // Refresh intervals
  autoRefreshEnabled: boolean
  refreshInterval: number
  
  // Date range for analytics
  dateRange: {
    start: string
    end: string
  }
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    statsCards: [],
    statsLoading: false,
    revenueChartData: null,
    userGrowthData: null,
    chartsLoading: false,
    recentActivities: [],
    activitiesLoading: false,
    tableData: [],
    tableLoading: false,
    tableSearch: '',
    tablePage: 1,
    tableItemsPerPage: 10,
    autoRefreshEnabled: true,
    refreshInterval: 30000, // 30 seconds
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0] // today
    }
  }),

  getters: {
    filteredTableData: (state) => {
      if (!state.tableSearch) return state.tableData
      
      const search = state.tableSearch.toLowerCase()
      return state.tableData.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(search)
        )
      )
    },

    paginatedTableData: (state) => {
      const filtered = state.filteredTableData
      const start = (state.tablePage - 1) * state.tableItemsPerPage
      const end = start + state.tableItemsPerPage
      return filtered.slice(start, end)
    },

    totalPages: (state) => {
      return Math.ceil(state.filteredTableData.length / state.tableItemsPerPage)
    },

    isLoading: (state) => {
      return state.statsLoading || state.chartsLoading || state.activitiesLoading || state.tableLoading
    },

    // Summary metrics
    totalRevenue: (state) => {
      const revenueCard = state.statsCards.find(card => card.title.includes('Revenue'))
      return revenueCard?.value || '$0'
    },

    totalUsers: (state) => {
      const usersCard = state.statsCards.find(card => card.title.includes('Users'))
      return usersCard?.value || '0'
    }
  },

  actions: {
    // Initialize dashboard data
    async initializeDashboard() {
      await Promise.all([
        this.loadStatsCards(),
        this.loadChartData(),
        this.loadRecentActivities(),
        this.loadTableData()
      ])
      
      // Set up auto-refresh if enabled
      if (this.autoRefreshEnabled) {
        this.startAutoRefresh()
      }
    },

    // Load stats cards
    async loadStatsCards() {
      this.statsLoading = true
      
      try {
        // Mock data - replace with actual API call
        const mockCards: DashboardCard[] = [
          {
            title: 'Total Revenue',
            value: '$24,500',
            icon: 'mdi-currency-usd',
            color: 'success',
            trend: { value: 12, direction: 'up', period: 'vs last month' }
          },
          {
            title: 'Active Users',
            value: '1,847',
            icon: 'mdi-account-group',
            color: 'info',
            trend: { value: 8, direction: 'up', period: 'vs last month' }
          },
          {
            title: 'Orders',
            value: '324',
            icon: 'mdi-cart',
            color: 'warning',
            trend: { value: 3, direction: 'down', period: 'vs last month' }
          },
          {
            title: 'Conversion',
            value: '3.2%',
            icon: 'mdi-trending-up',
            color: 'primary',
            trend: { value: 15, direction: 'up', period: 'vs last month' }
          }
        ]
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.statsCards = mockCards
        
        // TODO: Replace with actual API call
        // const { get } = useApi()
        // const response = await get('/dashboard/stats', { 
        //   start_date: this.dateRange.start,
        //   end_date: this.dateRange.end
        // })
        // this.statsCards = response.data
        
      } catch (error) {
        console.error('Error loading stats cards:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Loading Dashboard Stats')
      } finally {
        this.statsLoading = false
      }
    },

    // Load chart data
    async loadChartData() {
      this.chartsLoading = true
      
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 800))
        
        this.revenueChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Revenue',
              data: [12000, 15000, 18000, 16000, 22000, 24500],
              borderColor: '#1976D2',
              backgroundColor: 'rgba(25, 118, 210, 0.1)'
            }
          ]
        }
        
        this.userGrowthData = {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'New Users',
              data: [120, 150, 180, 200],
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)'
            }
          ]
        }
        
      } catch (error) {
        console.error('Error loading chart data:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Loading Charts')
      } finally {
        this.chartsLoading = false
      }
    },

    // Load recent activities
    async loadRecentActivities() {
      this.activitiesLoading = true
      
      try {
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 300))
        
        this.recentActivities = [
          {
            id: 1,
            title: 'New user registration',
            time: '2 minutes ago',
            icon: 'mdi-account-plus',
            color: 'success'
          },
          {
            id: 2,
            title: 'Payment received',
            time: '15 minutes ago',
            icon: 'mdi-credit-card',
            color: 'primary'
          },
          {
            id: 3,
            title: 'System backup completed',
            time: '1 hour ago',
            icon: 'mdi-backup-restore',
            color: 'info'
          },
          {
            id: 4,
            title: 'New support ticket',
            time: '2 hours ago',
            icon: 'mdi-help-circle',
            color: 'warning'
          }
        ]
        
      } catch (error) {
        console.error('Error loading activities:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Loading Activities')
      } finally {
        this.activitiesLoading = false
      }
    },

    // Load table data
    async loadTableData() {
      this.tableLoading = true
      
      try {
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 400))
        
        this.tableData = [
          {
            id: 1,
            customer: 'John Doe',
            amount: 1250,
            status: 'completed',
            date: '2024-01-15'
          },
          {
            id: 2,
            customer: 'Jane Smith',
            amount: 750,
            status: 'pending',
            date: '2024-01-14'
          },
          {
            id: 3,
            customer: 'Bob Wilson',
            amount: 2100,
            status: 'failed',
            date: '2024-01-13'
          },
          {
            id: 4,
            customer: 'Alice Johnson',
            amount: 1800,
            status: 'completed',
            date: '2024-01-12'
          },
          {
            id: 5,
            customer: 'Charlie Brown',
            amount: 950,
            status: 'pending',
            date: '2024-01-11'
          }
        ]
        
      } catch (error) {
        console.error('Error loading table data:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Loading Table Data')
      } finally {
        this.tableLoading = false
      }
    },

    // Refresh all data
    async refreshDashboard() {
      const uiStore = useUIStore()
      uiStore.showLoading('Refreshing dashboard...')
      
      try {
        await this.initializeDashboard()
        
        const notificationStore = useNotificationStore()
        notificationStore.success('Dashboard Updated', 'All data has been refreshed')
        
      } catch (error) {
        console.error('Error refreshing dashboard:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Dashboard Refresh')
      } finally {
        uiStore.hideLoading()
      }
    },

    // Auto-refresh functionality
    startAutoRefresh() {
      if (process.client) {
        setInterval(() => {
          if (this.autoRefreshEnabled && !document.hidden) {
            this.refreshDashboard()
          }
        }, this.refreshInterval)
      }
    },

    toggleAutoRefresh() {
      this.autoRefreshEnabled = !this.autoRefreshEnabled
      
      if (this.autoRefreshEnabled) {
        this.startAutoRefresh()
      }
    },

    // Table management
    setTableSearch(search: string) {
      this.tableSearch = search
      this.tablePage = 1 // Reset to first page
    },

    setTablePage(page: number) {
      this.tablePage = page
    },

    setItemsPerPage(itemsPerPage: number) {
      this.tableItemsPerPage = itemsPerPage
      this.tablePage = 1 // Reset to first page
    },

    // Date range management
    setDateRange(start: string, end: string) {
      this.dateRange = { start, end }
      this.refreshDashboard()
    },

    // Item actions
    async viewItem(id: number) {
      const notificationStore = useNotificationStore()
      notificationStore.info('View Item', `Opening details for item ${id}`)
      // Navigate to item details page
      await navigateTo(`/items/${id}`)
    },

    async editItem(id: number) {
      const notificationStore = useNotificationStore()
      notificationStore.info('Edit Item', `Opening editor for item ${id}`)
      // Navigate to edit page
      await navigateTo(`/items/${id}/edit`)
    },

    async deleteItem(id: number) {
      try {
        // Show confirmation dialog first (would need a dialog store)
        const confirmed = confirm('Are you sure you want to delete this item?')
        if (!confirmed) return
        
        // Mock delete
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Remove from table data
        this.tableData = this.tableData.filter(item => item.id !== id)
        
        const notificationStore = useNotificationStore()
        notificationStore.success('Item Deleted', 'The item has been successfully removed')
        
      } catch (error) {
        console.error('Error deleting item:', error)
        const notificationStore = useNotificationStore()
        notificationStore.handleApiError(error, 'Delete Item')
      }
    }
  }
})
