<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Reports</h1>
      <v-btn color="primary" prepend-icon="mdi-download">
        Export
      </v-btn>
    </div>
    
    <v-card>
      <v-tabs v-model="activeTab">
        <v-tab value="overview">Overview</v-tab>
        <v-tab value="campaigns">Campaigns</v-tab>
        <v-tab value="subscribers">Subscribers</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="activeTab">
          <v-window-item value="overview">
            <v-row>
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Performance Overview</v-card-title>
                  <v-card-text>
                    <v-chart class="chart" :option="overviewChartOption" autoresize />
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Key Metrics</v-card-title>
                  <v-list>
                    <v-list-item v-for="metric in metrics" :key="metric.label">
                      <v-list-item-title>{{ metric.label }}</v-list-item-title>
                      <template #append>
                        <span class="text-h6">{{ metric.value }}</span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="campaigns">
            <v-data-table
              :headers="campaignHeaders"
              :items="campaigns"
              :loading="loading"
            />
          </v-window-item>

          <v-window-item value="subscribers">
            <v-data-table
              :headers="subscriberHeaders"
              :items="subscribers"
              :loading="loading"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
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
const activeTab = ref('overview')

// Compute metrics from real API data
const metrics = computed(() => {
  const overview = statsStore.overview || {}
  const leads = overview.leads || {}
  const engagement = overview.engagement || {}
  
  return [
    { label: 'Total Subscribers', value: leads.total || 0 },
    { label: 'Average Open Rate', value: engagement.open_rate ? `${(engagement.open_rate * 100).toFixed(1)}%` : '0%' },
    { label: 'Average Click Rate', value: engagement.click_rate ? `${(engagement.click_rate * 100).toFixed(1)}%` : '0%' },
    { label: 'Growth Rate', value: 'N/A' }
  ]
})

const campaignHeaders = [
  { title: 'Campaign', key: 'name' },
  { title: 'Sent', key: 'sent' },
  { title: 'Opens', key: 'opens' },
  { title: 'Clicks', key: 'clicks' },
  { title: 'Revenue', key: 'revenue' }
]

const subscriberHeaders = [
  { title: 'List', key: 'name' },
  { title: 'Subscribers', key: 'total' },
  { title: 'Active', key: 'active' },
  { title: 'Growth', key: 'growth' }
]

// Compute campaigns from real API data
const campaigns = computed(() => {
  if (!statsStore.byCampaign || statsStore.byCampaign.length === 0) return []
  
  return statsStore.byCampaign.map((campaign: any) => ({
    name: campaign.name || campaign.campaign_name || 'Untitled',
    sent: campaign.total_sent || 0,
    opens: campaign.total_opens ? `${((campaign.total_opens / campaign.total_sent) * 100).toFixed(1)}%` : '0%',
    clicks: campaign.total_clicks ? `${((campaign.total_clicks / campaign.total_sent) * 100).toFixed(1)}%` : '0%',
    revenue: 'N/A'
  }))
})

const subscribers = ref([])

// Compute chart from real API data
const overviewChartOption = computed(() => {
  if (!statsStore.weekly || statsStore.weekly.length === 0) {
    return {
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: []
    }
  }

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Subscribers', 'Opens', 'Clicks'] },
    xAxis: {
      type: 'category',
      data: statsStore.weekly.map((w: any) => w.week || w.date || '')
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Subscribers',
        type: 'line',
        data: statsStore.weekly.map((w: any) => w.subscribers || 0)
      },
      {
        name: 'Opens',
        type: 'line',
        data: statsStore.weekly.map((w: any) => w.opens || 0)
      },
      {
        name: 'Clicks',
        type: 'line',
        data: statsStore.weekly.map((w: any) => w.clicks || 0)
      }
    ]
  }
})

onMounted(async () => {
  try {
    await Promise.all([
      statsStore.fetchOverview(),
      statsStore.fetchWeekly(),
      statsStore.fetchCampaignsStats()
    ])
  } catch (error) {
    console.error('Failed to load reports:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 300px;
}
</style>