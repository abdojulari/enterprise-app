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
import { ref, onMounted } from 'vue'

const loading = ref(true)
const activeTab = ref('overview')

const metrics = ref([
  { label: 'Total Subscribers', value: '12,345' },
  { label: 'Average Open Rate', value: '24.5%' },
  { label: 'Average Click Rate', value: '3.2%' },
  { label: 'Growth Rate', value: '+5.4%' }
])

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

const campaigns = ref([
  { name: 'Welcome Series', sent: '1,234', opens: '45%', clicks: '12%', revenue: '$1,234' },
  { name: 'Monthly Newsletter', sent: '5,678', opens: '32%', clicks: '8%', revenue: '$2,345' }
])

const subscribers = ref([
  { name: 'Main List', total: '10,234', active: '8,123', growth: '+2.3%' },
  { name: 'Newsletter', total: '5,678', active: '4,567', growth: '+1.5%' }
])

const overviewChartOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['Subscribers', 'Opens', 'Clicks']
  },
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Subscribers',
      type: 'line',
      data: [1000, 1200, 1400, 1800, 2200, 2600]
    },
    {
      name: 'Opens',
      type: 'line',
      data: [500, 600, 700, 900, 1100, 1300]
    },
    {
      name: 'Clicks',
      type: 'line',
      data: [100, 120, 140, 180, 220, 260]
    }
  ]
})

onMounted(async () => {
  try {
    // TODO: Fetch actual report data from API
    await new Promise(resolve => setTimeout(resolve, 1000))
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