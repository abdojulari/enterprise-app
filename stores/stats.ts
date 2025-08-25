import { defineStore } from 'pinia'

interface OverviewStats {
  leads?: { total?: number; active?: number; unsubscribed?: number }
  campaigns?: { total?: number; completed?: number; recent_week?: number }
  emails?: { total_sent?: number; recent_week?: number }
  engagement?: { total_opens?: number; total_clicks?: number; total_unsubscribes?: number; open_rate?: number; click_rate?: number; unsubscribe_rate?: number }
}

export const useStatsStore = defineStore('stats', {
  state: () => ({
    overview: {} as OverviewStats,
    weekly: [] as any[],
    byCampaign: [] as any[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchOverview() {
      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const base = config.public.apiBase || 'http://localhost:8090'
        this.overview = await $fetch<OverviewStats>(`${base}/api/stats/overview`)
      } catch (err: any) {
        this.error = err?.message || 'Failed to load stats overview'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchWeekly() {
      try {
        const config = useRuntimeConfig()
        const base = config.public.apiBase || 'http://localhost:8090'
        const res = await $fetch<any>(`${base}/api/stats/weekly`)
        this.weekly = (res && (res.weekly_stats || res.data || res)) as any[]
      } catch (err) {
        throw err
      }
    },

    async fetchCampaignsStats() {
      try {
        const config = useRuntimeConfig()
        const base = config.public.apiBase || 'http://localhost:8090'
        this.byCampaign = await $fetch<any[]>(`${base}/api/stats/campaigns`)
      } catch (err) {
        throw err
      }
    }
  }
})


