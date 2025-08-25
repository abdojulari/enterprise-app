import { defineStore } from 'pinia'

interface EnrichmentStatus { status?: string; queue?: number }

export const useEnrichmentStore = defineStore('enrichment', {
  state: () => ({
    status: {} as EnrichmentStatus,
    loading: false,
    error: null as string | null,
    lastResult: null as any
  }),

  actions: {
    async fetchStatus() {
      try {
        const config = useRuntimeConfig()
        const base = config.public.apiBase || 'http://localhost:8090'
        this.status = await $fetch<EnrichmentStatus>(`${base}/api/enrichment/status`)
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch enrichment status'
        throw err
      }
    },

    async domainSearch(domain: string) {
      const config = useRuntimeConfig()
      const base = config.public.apiBase || 'http://localhost:8090'
      this.lastResult = await $fetch(`${base}/api/enrichment/domain-search`, { method: 'POST', body: { domain } })
      return this.lastResult
    },

    async verifyEmail(email: string) {
      const config = useRuntimeConfig()
      const base = config.public.apiBase || 'http://localhost:8090'
      this.lastResult = await $fetch(`${base}/api/enrichment/verify-email`, { method: 'POST', body: { email } })
      return this.lastResult
    },

    async findEmail(name: string, domain: string) {
      const config = useRuntimeConfig()
      const base = config.public.apiBase || 'http://localhost:8090'
      this.lastResult = await $fetch(`${base}/api/enrichment/find-email`, { method: 'POST', body: { name, domain } })
      return this.lastResult
    }
  }
})


