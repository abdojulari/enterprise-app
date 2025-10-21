<template>
  <div>
    <h1 class="text-h4 mb-6">Stats</h1>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="mb-6 pa-5" variant="outlined">
          <v-card-title>Weekly Stats</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="weeklyHeaders"
              :items="weeklyStats"
              :loading="loading"
            />
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card class="mb-6 pa-5" variant="outlined">
          <v-card-title>Campaign Stats</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="campaignHeaders"
              :items="campaignStats"
              :loading="loading"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStatsStore } from '~/stores/stats'

definePageMeta({
  middleware: 'auth'
})

const statsStore = useStatsStore()
const loading = ref(true)

const weeklyHeaders = [
  { title: 'Metric', key: 'metric' },
  { title: 'Value', key: 'value' },
  { title: 'Change', key: 'change' }
]

const campaignHeaders = [
  { title: 'Campaign', key: 'name' },
  { title: 'Sent', key: 'sent' },
  { title: 'Opens', key: 'opens' },
  { title: 'Clicks', key: 'clicks' }
]

// Transform weekly stats from API into table format
const weeklyStats = computed(() => {
  if (!statsStore.weekly || statsStore.weekly.length === 0) return []
  
  const latest = statsStore.weekly[0] || {}
  return [
    { metric: 'Total Sends', value: latest.sent || 0, change: 'N/A' },
    { metric: 'Open Rate', value: latest.opens ? `${((latest.opens / latest.sent) * 100).toFixed(1)}%` : '0%', change: 'N/A' },
    { metric: 'Click Rate', value: latest.clicks ? `${((latest.clicks / latest.sent) * 100).toFixed(1)}%` : '0%', change: 'N/A' },
    { metric: 'Bounces', value: '0%', change: 'N/A' }
  ]
})

// Transform campaign stats from API into table format
const campaignStats = computed(() => {
  if (!statsStore.byCampaign || statsStore.byCampaign.length === 0) return []
  
  return statsStore.byCampaign.map((campaign: any) => ({
    name: campaign.name || campaign.campaign_name || 'Untitled',
    sent: campaign.total_sent || 0,
    opens: campaign.total_opens ? `${((campaign.total_opens / campaign.total_sent) * 100).toFixed(1)}%` : '0%',
    clicks: campaign.total_clicks ? `${((campaign.total_clicks / campaign.total_sent) * 100).toFixed(1)}%` : '0%'
  }))
})

onMounted(async () => {
  try {
    await Promise.all([
      statsStore.fetchWeekly(),
      statsStore.fetchCampaignsStats()
    ])
  } catch (error) {
    console.error('Failed to load stats:', error)
  } finally {
    loading.value = false
  }
})
</script>