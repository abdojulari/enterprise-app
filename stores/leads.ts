import { defineStore } from 'pinia'

interface LeadCounts {
  total_leads?: number
  active_leads?: number
  unsubscribed?: number
}

export const useLeadsStore = defineStore('leads', {
  state: () => ({
    counts: {} as LeadCounts,
    uploading: false,
    error: null as string | null,
    lastUploadResult: null as any
  }),

  actions: {
    async fetchCounts() {
      try {
        const config = useRuntimeConfig()
        const base = config.public.emailAutomationAPI || 'http://localhost:8000'
        this.counts = await $fetch<LeadCounts>(`${base}/api/upload/leads/count`)
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch lead counts'
        throw err
      }
    },

    async uploadCsv(file: File) {
      this.uploading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const base = config.public.emailAutomationAPI || 'http://localhost:8000'
        const form = new FormData()
        form.append('file', file)
        const result = await $fetch(`${base}/api/upload/csv`, {
          method: 'POST',
          body: form
        })
        this.lastUploadResult = result
        await this.fetchCounts()
        return result
      } catch (err: any) {
        this.error = err?.message || 'Upload failed'
        throw err
      } finally {
        this.uploading = false
      }
    }
  }
})


