import { defineStore } from 'pinia'

interface DashboardState {
  // Raw API data
  overview: any
  weeklyStats: any[]
  campaignStats: any[]
  loading: boolean
  error: string | null
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    overview: null,
    weeklyStats: [],
    campaignStats: [],
    loading: false,
    error: null
  }),

  getters: {
    // Stats cards for dashboard display
    stats: (state) => {
      if (!state.overview) return []
      
      const leads = state.overview.leads || {}
      const campaigns = state.overview.campaigns || {}
      const emails = state.overview.emails || {}
      const engagement = state.overview.engagement || {}
      
      return [
        {
          label: 'Total Leads',
          value: leads.total || 0,
          trend: leads.active ? ((leads.active / leads.total) * 100).toFixed(1) : 0,
          color: 'primary',
          icon: 'mdi-account-group'
        },
        {
          label: 'Campaigns',
          value: campaigns.total || 0,
          trend: campaigns.recent_week || 0,
          color: 'success',
          icon: 'mdi-email-multiple'
        },
        {
          label: 'Emails Sent',
          value: emails.total_sent || 0,
          trend: emails.recent_week || 0,
          color: 'info',
          icon: 'mdi-send'
        },
        {
          label: 'Open Rate',
          value: engagement.open_rate ? `${(engagement.open_rate * 100).toFixed(1)}%` : '0%',
          trend: engagement.click_rate ? (engagement.click_rate * 100).toFixed(1) : 0,
          color: 'warning',
          icon: 'mdi-email-open'
        }
      ]
    },

    // Chart option for ECharts
    chartOption: (state) => {
      if (!state.weeklyStats || state.weeklyStats.length === 0) {
        return {
          title: { text: 'No data available' },
          xAxis: { type: 'category', data: [] },
          yAxis: { type: 'value' },
          series: []
        }
      }

      const weeks = state.weeklyStats.map((s: any) => s.week || s.date || '')
      const opens = state.weeklyStats.map((s: any) => s.opens || 0)
      const clicks = state.weeklyStats.map((s: any) => s.clicks || 0)
      const sent = state.weeklyStats.map((s: any) => s.sent || 0)

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: ['Emails Sent', 'Opens', 'Clicks']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: weeks
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Emails Sent',
            type: 'line',
            data: sent,
            smooth: true,
            itemStyle: { color: '#1976D2' }
          },
          {
            name: 'Opens',
            type: 'line',
            data: opens,
            smooth: true,
            itemStyle: { color: '#4CAF50' }
          },
          {
            name: 'Clicks',
            type: 'line',
            data: clicks,
            smooth: true,
            itemStyle: { color: '#FFC107' }
          }
        ]
      }
    },

    // Recent activity from campaign stats
    recentActivity: (state) => {
      if (!state.campaignStats || state.campaignStats.length === 0) return []
      
      return state.campaignStats.slice(0, 5).map((campaign: any) => ({
        title: campaign.name || campaign.campaign_name || 'Untitled Campaign',
        description: `${campaign.total_sent || 0} sent • ${campaign.total_opens || 0} opens • ${campaign.total_clicks || 0} clicks`,
        timestamp: campaign.last_sent || campaign.created_at || 'Recently',
        icon: 'mdi-email-newsletter',
        color: campaign.total_opens > 0 ? 'success' : 'grey'
      }))
    },

    isLoading: (state) => state.loading
  },

  actions: {
    // Fetch all dashboard data from real API
    async fetchDashboardData() {
      this.loading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const baseURL = config.public.emailAutomationAPI || 'http://localhost:8000'

        // Fetch all data in parallel from real API endpoints
        const [overview, weekly, campaigns] = await Promise.all([
          $fetch(`${baseURL}/api/stats/overview`).catch(() => ({})),
          $fetch(`${baseURL}/api/stats/weekly`).catch(() => []),
          $fetch(`${baseURL}/api/stats/campaigns`).catch(() => [])
        ])

        // Store raw data - getters will transform it
        this.overview = overview
        this.weeklyStats = Array.isArray(weekly) ? weekly : (weekly?.weekly_stats || weekly?.data || [])
        this.campaignStats = Array.isArray(campaigns) ? campaigns : (campaigns?.data || [])

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        this.error = error.message || 'Failed to load dashboard data'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Refresh dashboard data
    async refresh() {
      await this.fetchDashboardData()
    }
  }
})
