// Email Automation API Integration for Nuxt
// Comprehensive composable for social media scraping, email enrichment, and outreach automation

import { useAuthStore } from '~/stores/auth'

export interface EmailAutomationConfig {
  baseURL: string
}

// ============================================
// TYPE DEFINITIONS
// ============================================

// Social Media Scraping Types
export interface ScrapeKeywordsRequest {
  platform: 'reddit' | 'twitter' | 'kijiji' | 'google'
  keywords: string[]
  limit?: number
  location?: string
}

export interface ScrapeUserRequest {
  platform: 'reddit' | 'twitter' | 'kijiji' | 'google'
  username: string
  limit?: number
}

export interface ScrapingJob {
  id: number
  platform: string
  job_type: string
  parameters: Record<string, any>
  status: 'running' | 'completed' | 'failed'
  results_count: number
  error_message?: string
  started_at: string
  completed_at?: string
  created_at: string
}

export interface SocialPost {
  id: number
  post_id: string
  author_username: string
  title: string
  content: string
  url: string
  engagement_score: number
  post_date: string
  keywords_matched: string[]
  location?: string
  platform: string
}

// Email Enrichment Types
export interface FindEmailRequest {
  first_name: string
  last_name: string
  domain: string
}

export interface DomainSearchRequest {
  domain: string
  limit?: number
}

export interface VerifyEmailRequest {
  email: string
}

export interface EmailResult {
  email: string
  first_name?: string
  last_name?: string
  company?: string
  position?: string
  confidence?: number
  sources: string[]
}

// Outreach Types
export interface OutreachTemplate {
  id: number
  name: string
  subject: string
  content: string
  platform: string
  template_type: string
  variables: string[]
}

export interface GenerateMessageRequest {
  template_id: number
  lead_data: Record<string, any>
  platform: string
}

export interface SendOutreachRequest {
  lead_id: number
  template_id: number
  message: string
  subject?: string
  platform: string
}

// Analytics Types
export interface ScrapingStats {
  period_days: number
  job_statistics: Record<string, {
    total: number
    completed: number
    failed: number
    results: number
  }>
  post_statistics: Record<string, any>
  lead_statistics: Record<string, any>
  summary: {
    total_jobs: number
    total_posts: number
    total_leads: number
    avg_relevance_score: number
  }
}

export interface StatsOverview {
  leads: {
    total: number
    active: number
    unsubscribed: number
  }
  campaigns: {
    total: number
    completed: number
    recent_week: number
  }
  emails: {
    total_sent: number
    recent_week: number
  }
  engagement: {
    total_opens: number
    total_clicks: number
    total_unsubscribes: number
    open_rate: number
    click_rate: number
    unsubscribe_rate: number
  }
}

// ============================================
// NUXT COMPOSABLE
// ============================================

export const useEmailAutomation = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.emailAutomationAPI || 'http://localhost:8000'
  const authStore = useAuthStore()

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    return headers
  }

  // ============================================
  // SOCIAL MEDIA SCRAPING
  // ============================================

  const scrapeKeywords = async (request: ScrapeKeywordsRequest): Promise<{ message: string; job_id: number; status: string }> => {
    return await $fetch('/api/scrape/keywords', {
      baseURL,
      method: 'POST',
      headers: getAuthHeaders(),
      body: request
    })
  }

  const scrapeUser = async (request: ScrapeUserRequest): Promise<{ message: string; job_id: number; status: string }> => {
    return await $fetch('/api/scrape/user', {
      baseURL,
      method: 'POST',
      headers: getAuthHeaders(),
      body: request
    })
  }

  const scrapeTrending = async (platform: string): Promise<{ message: string; job_id: number; status: string }> => {
    return await $fetch(`/scrape/trending/${platform}`, {
      baseURL,
      method: 'POST',
      headers: getAuthHeaders()
    })
  }

  const getScrapingJobs = async (): Promise<ScrapingJob[]> => {
    return await $fetch('/api/scraping-jobs', { 
      baseURL,
      headers: getAuthHeaders()
    })
  }

  const getScrapingJob = async (jobId: number): Promise<ScrapingJob> => {
    return await $fetch(`/api/scraping-jobs/${jobId}`, { 
      baseURL,
      headers: getAuthHeaders()
    })
  }

  const getSocialPosts = async (limit = 50): Promise<SocialPost[]> => {
    return await $fetch(`/api/social-posts?limit=${limit}`, { 
      baseURL,
      headers: getAuthHeaders()
    })
  }

  const getSocialLeads = async (): Promise<any[]> => {
    return await $fetch('/api/leads/social', { 
      baseURL,
      headers: getAuthHeaders()
    })
  }

  const updateLeadStatus = async (leadId: number, status: string): Promise<any> => {
    return await $fetch(`/api/leads/${leadId}/status`, {
      baseURL,
      method: 'PUT',
      body: { status }
    })
  }

  const markLeadContacted = async (leadId: number): Promise<any> => {
    return await $fetch(`/api/leads/${leadId}/contact`, {
      baseURL,
      method: 'POST'
    })
  }

  // ============================================
  // EMAIL ENRICHMENT
  // ============================================

  const findEmail = async (request: FindEmailRequest): Promise<EmailResult> => {
    return await $fetch('/api/enrichment/find-email', {
      baseURL,
      method: 'POST',
      body: request
    })
  }

  const searchDomain = async (request: DomainSearchRequest): Promise<EmailResult[]> => {
    return await $fetch('/api/enrichment/domain-search', {
      baseURL,
      method: 'POST',
      body: request
    })
  }

  const verifyEmail = async (request: VerifyEmailRequest): Promise<{ email: string; valid: boolean; confidence: number }> => {
    return await $fetch('/api/enrichment/verify-email', {
      baseURL,
      method: 'POST',
      body: request
    })
  }

  const getEnrichmentStatus = async (): Promise<{ enabled: boolean; service: string; message: string }> => {
    return await $fetch('/api/enrichment/status', { baseURL })
  }

  // ============================================
  // OUTREACH AUTOMATION
  // ============================================

  const setupTemplates = async (): Promise<{ message: string }> => {
    return await $fetch('/api/outreach/setup-templates', {
      baseURL,
      method: 'POST'
    })
  }

  const getOutreachTemplates = async (): Promise<OutreachTemplate[]> => {
    return await $fetch('/api/outreach/templates', { baseURL })
  }

  const generateMessage = async (request: GenerateMessageRequest): Promise<{ message: string; subject?: string }> => {
    return await $fetch('/api/outreach/generate-message', {
      baseURL,
      method: 'POST',
      body: request
    })
  }

  const sendOutreach = async (request: SendOutreachRequest): Promise<{ success: boolean; message: string }> => {
    return await $fetch('/api/outreach/send', {
      baseURL,
      method: 'POST',
      body: request
    })
  }

  const getReadyForOutreach = async (): Promise<any[]> => {
    return await $fetch('/api/outreach/ready', { baseURL })
  }

  const bulkOutreach = async (requests: SendOutreachRequest[]): Promise<{ sent: number; failed: number; results: any[] }> => {
    return await $fetch('/api/outreach/bulk-outreach', {
      baseURL,
      method: 'POST',
      body: { outreach_requests: requests }
    })
  }

  const previewTemplate = async (templateId: number): Promise<{ preview: string }> => {
    return await $fetch(`/api/outreach/templates/${templateId}/preview`, { baseURL })
  }

  const getOutreachAnalytics = async (): Promise<any> => {
    return await $fetch('/api/outreach/analytics', { baseURL })
  }

  const getPerformanceReport = async (): Promise<any> => {
    return await $fetch('/api/outreach/performance-report', { baseURL })
  }

  // ============================================
  // CAMPAIGNS
  // ============================================

  const getCampaigns = async (): Promise<any[]> => {
    return await $fetch('/api/campaigns/', { 
      baseURL,
      headers: getAuthHeaders()
    })
  }

  const createCampaign = async (campaign: any): Promise<any> => {
    return await $fetch('/api/campaigns/', {
      baseURL,
      method: 'POST',
      headers: getAuthHeaders(),
      body: campaign
    })
  }

  const deleteCampaign = async (campaignId: number): Promise<any> => {
    return await $fetch(`/api/campaigns/${campaignId}`, {
      baseURL,
      method: 'DELETE',
      headers: getAuthHeaders()
    })
  }

  const sendCampaignToAll = async (campaignId: number, cityFilter?: string): Promise<any> => {
    return await $fetch(`/api/campaigns/${campaignId}/send`, {
      baseURL,
      method: 'POST',
      headers: getAuthHeaders(),
      body: { city_filter: cityFilter || null }
    })
  }

  const sendTestCampaign = async (campaignId: number, testEmail: string): Promise<any> => {
    return await $fetch(`/api/campaigns/${campaignId}/test`, {
      baseURL,
      method: 'POST',
      headers: getAuthHeaders(),
      body: { test_email: testEmail }
    })
  }

  const getCampaignStats = async (campaignId: number): Promise<any> => {
    return await $fetch(`/api/campaigns/${campaignId}/stats`, {
      baseURL,
      headers: getAuthHeaders()
    })
  }

  const deleteCampaignsBulk = async (campaignIds: number[]): Promise<any> => {
    return await $fetch('/api/campaigns/bulk', {
      baseURL,
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: { campaign_ids: campaignIds }
    })
  }

  const getLeadCount = async (): Promise<any> => {
    return await $fetch('/api/upload/leads/count', {
      baseURL,
      headers: getAuthHeaders()
    })
  }

  // ============================================
  // ANALYTICS & STATS
  // ============================================

  const getScrapingStats = async (): Promise<ScrapingStats> => {
    return await $fetch('/api/analytics/scraping-stats', { 
      baseURL,
      headers: getAuthHeaders()
    })
  }

  const getStatsOverview = async (): Promise<StatsOverview> => {
    return await $fetch('/api/stats/overview', { 
      baseURL,
      headers: getAuthHeaders()
    })
  }

  const getWeeklyStats = async (): Promise<any> => {
    return await $fetch('/api/stats/weekly', { 
      baseURL,
      headers: getAuthHeaders()
    })
  }

  // ============================================
  // TRACKING
  // ============================================

  const trackEmailOpen = async (campaignId: number, leadId: number): Promise<any> => {
    return await $fetch(`/api/tracking/open/${campaignId}/${leadId}`, { baseURL })
  }

  const trackEmailClick = async (campaignId: number, leadId: number): Promise<any> => {
    return await $fetch(`/api/tracking/click/${campaignId}/${leadId}`, { baseURL })
  }

  const unsubscribeLead = async (leadId: number): Promise<any> => {
    return await $fetch(`/api/tracking/unsubscribe/${leadId}`, { baseURL })
  }

  // ============================================
  // RETURN ALL METHODS
  // ============================================

  return {
    // Social Media Scraping
    scrapeKeywords,
    scrapeUser,
    scrapeTrending,
    getScrapingJobs,
    getScrapingJob,
    getSocialPosts,
    getSocialLeads,
    updateLeadStatus,
    markLeadContacted,

    // Email Enrichment
    findEmail,
    searchDomain,
    verifyEmail,
    getEnrichmentStatus,

    // Outreach Automation
    setupTemplates,
    getOutreachTemplates,
    generateMessage,
    sendOutreach,
    getReadyForOutreach,
    bulkOutreach,
    previewTemplate,
    getOutreachAnalytics,
    getPerformanceReport,

    // Campaigns
    getCampaigns,
    createCampaign,
    deleteCampaign,
    sendCampaignToAll,
    sendTestCampaign,
    getCampaignStats,
    deleteCampaignsBulk,
    getLeadCount,

    // Analytics & Stats
    getScrapingStats,
    getStatsOverview,
    getWeeklyStats,

    // Tracking
    trackEmailOpen,
    trackEmailClick,
    unsubscribeLead
  }
}

