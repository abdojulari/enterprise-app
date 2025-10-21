import { defineStore } from 'pinia'

interface Campaign {
  id: number
  name: string
  subject?: string
  city_filter?: string
  status?: string
  created_at?: string
  sent_at?: string
}

interface CampaignStats {
  total_sent?: number
  total_opens?: number
  total_clicks?: number
  total_unsubscribes?: number
  open_rate?: number
  click_rate?: number
  unsubscribe_rate?: number
}

export const useCampaignsStore = defineStore('campaigns', {
  state: () => ({
    campaigns: [] as Campaign[],
    statsById: {} as Record<number, CampaignStats>,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCampaigns() {
      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const base = config.public.emailAutomationAPI || 'http://localhost:8000'
        const data = await $fetch<Campaign[]>(`${base}/api/campaigns/`)
        this.campaigns = data || []
      } catch (err: any) {
        this.error = err?.message || 'Failed to load campaigns'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchCampaignStats(campaignId: number) {
      try {
        const config = useRuntimeConfig()
        const base = config.public.emailAutomationAPI || 'http://localhost:8000'
        const stats = await $fetch<CampaignStats>(`${base}/api/campaigns/${campaignId}/stats`)
        this.statsById[campaignId] = stats || {}
        return stats
      } catch (err) {
        throw err
      }
    },

    async sendCampaign(campaignId: number) {
      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const base = config.public.emailAutomationAPI || 'http://localhost:8000'
        await $fetch(`${base}/api/campaigns/${campaignId}/send`, { method: 'POST' })
        await this.fetchCampaigns()
      } catch (err: any) {
        this.error = err?.message || 'Failed to send campaign'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})


