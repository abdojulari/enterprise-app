<template>
  <div>
    <h1 class="text-h4 mb-6">Analytics Dashboard</h1>

    <!-- Overview Stats -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-h4">{{ stats.leads?.total || 0 }}</div>
            <div class="text-caption text-medium-emphasis">Total Leads</div>
            <div class="mt-2">
              <v-chip size="small" color="success" variant="outlined">
                {{ stats.leads?.active || 0 }} Active
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-h4">{{ scrapingStats.summary?.total_posts || 0 }}</div>
            <div class="text-caption text-medium-emphasis">Scraped Posts</div>
            <div class="mt-2">
              <v-chip size="small" color="primary" variant="outlined">
                {{ scrapingStats.summary?.total_jobs || 0 }} Jobs
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-h4">{{ stats.campaigns?.total || 0 }}</div>
            <div class="text-caption text-medium-emphasis">Campaigns</div>
            <div class="mt-2">
              <v-chip size="small" color="info" variant="outlined">
                {{ stats.campaigns?.completed || 0 }} Completed
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-h4">{{ stats.emails?.total_sent || 0 }}</div>
            <div class="text-caption text-medium-emphasis">Emails Sent</div>
            <div class="mt-2">
              <v-chip size="small" color="secondary" variant="outlined">
                {{ ((stats.engagement?.open_rate || 0) * 100).toFixed(1) }}% Open Rate
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row class="mt-4">
      <!-- Platform Distribution -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Posts by Platform</v-card-title>
          <v-card-text style="height: 400px;">
            <v-chart
              v-if="platformChartData"
              :option="platformChartData"
              autoresize
              style="height: 100%; width: 100%;"
            />
            <div v-else class="d-flex align-center justify-center" style="height: 100%;">
              <v-progress-circular indeterminate />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Job Status -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Scraping Jobs Status</v-card-title>
          <v-card-text style="height: 400px;">
            <v-chart
              v-if="jobStatusChartData"
              :option="jobStatusChartData"
              autoresize
              style="height: 100%; width: 100%;"
            />
            <div v-else class="d-flex align-center justify-center" style="height: 100%;">
              <v-progress-circular indeterminate />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Lead Sources -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Leads by Source</v-card-title>
          <v-card-text style="height: 400px;">
            <v-chart
              v-if="leadSourceChartData"
              :option="leadSourceChartData"
              autoresize
              style="height: 100%; width: 100%;"
            />
            <div v-else class="d-flex align-center justify-center" style="height: 100%;">
              <v-progress-circular indeterminate />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Relevance Scores -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Post Relevance Distribution</v-card-title>
          <v-card-text style="height: 400px;">
            <v-chart
              v-if="relevanceChartData"
              :option="relevanceChartData"
              autoresize
              style="height: 100%; width: 100%;"
            />
            <div v-else class="d-flex align-center justify-center" style="height: 100%;">
              <v-progress-circular indeterminate />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Platform Statistics Table -->
    <v-card class="mt-6">
      <v-card-title>Platform Statistics</v-card-title>
      <v-data-table
        :headers="platformHeaders"
        :items="platformTableData"
        :loading="loading"
        density="compact"
      >
        <template #item.platform="{ item }">
          <v-chip size="small" variant="outlined">{{ item.platform }}</v-chip>
        </template>
        <template #item.completion_rate="{ item }">
          <v-progress-linear
            :model-value="item.completion_rate"
            color="primary"
            height="8"
          >
            <template #default>
              <span class="text-caption">{{ item.completion_rate.toFixed(1) }}%</span>
            </template>
          </v-progress-linear>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTheme } from 'vuetify'
import { useEmailAutomation } from '~/composables/useEmailAutomation'
import { useNotificationStore } from '~/stores/notification'

definePageMeta({
  middleware: 'auth'
})

// Register ECharts components
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const theme = useTheme()
const { getStatsOverview, getScrapingStats } = useEmailAutomation()
const notificationStore = useNotificationStore()

const loading = ref(false)
const stats = ref<any>({})
const scrapingStats = ref<any>({})

const platformHeaders = [
  { title: 'Platform', key: 'platform' },
  { title: 'Total Jobs', key: 'total_jobs' },
  { title: 'Completed', key: 'completed' },
  { title: 'Failed', key: 'failed' },
  { title: 'Results', key: 'results' },
  { title: 'Completion Rate', key: 'completion_rate' }
]

// Fetch data from backend
const fetchData = async () => {
  loading.value = true
  try {
    const [overviewData, scrapingData] = await Promise.all([
      getStatsOverview(),
      getScrapingStats()
    ])
    
    stats.value = overviewData
    scrapingStats.value = scrapingData
  } catch (error: any) {
    console.error('Failed to fetch analytics:', error)
    notificationStore.error('Failed to load analytics data')
  } finally {
    loading.value = false
  }
}

// Platform Chart Data
const platformChartData = computed(() => {
  if (!scrapingStats.value.post_statistics) return null
  
  const data = Object.entries(scrapingStats.value.post_statistics).map(([platform, stats]: [string, any]) => ({
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    value: stats.total || 0
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: theme.current.value.dark ? '#fff' : '#000'
      }
    },
    series: [
      {
        name: 'Posts',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data
      }
    ]
  }
})

// Job Status Chart
const jobStatusChartData = computed(() => {
  if (!scrapingStats.value.job_statistics) return null
  
  const platforms = Object.keys(scrapingStats.value.job_statistics)
  const completedData = platforms.map(p => scrapingStats.value.job_statistics[p].completed || 0)
  const failedData = platforms.map(p => scrapingStats.value.job_statistics[p].failed || 0)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      textStyle: {
        color: theme.current.value.dark ? '#fff' : '#000'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
      axisLabel: {
        color: theme.current.value.dark ? '#fff' : '#000'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: theme.current.value.dark ? '#fff' : '#000'
      }
    },
    series: [
      {
        name: 'Completed',
        type: 'bar',
        data: completedData,
        itemStyle: { color: '#4CAF50' }
      },
      {
        name: 'Failed',
        type: 'bar',
        data: failedData,
        itemStyle: { color: '#F44336' }
      }
    ]
  }
})

// Lead Source Chart
const leadSourceChartData = computed(() => {
  if (!scrapingStats.value.lead_statistics) return null
  
  const data = Object.entries(scrapingStats.value.lead_statistics).map(([platform, stats]: [string, any]) => ({
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    value: stats.total || 0
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} leads'
    },
    legend: {
      textStyle: {
        color: theme.current.value.dark ? '#fff' : '#000'
      }
    },
    series: [
      {
        name: 'Leads',
        type: 'pie',
        radius: '60%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
})

// Relevance Chart
const relevanceChartData = computed(() => {
  if (!scrapingStats.value.post_statistics) return null
  
  const platforms = Object.keys(scrapingStats.value.post_statistics)
  const highRelevance = platforms.map(p => scrapingStats.value.post_statistics[p].high_relevance || 0)
  const totalPosts = platforms.map(p => scrapingStats.value.post_statistics[p].total || 0)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      textStyle: {
        color: theme.current.value.dark ? '#fff' : '#000'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
      axisLabel: {
        color: theme.current.value.dark ? '#fff' : '#000'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: theme.current.value.dark ? '#fff' : '#000'
      }
    },
    series: [
      {
        name: 'Total Posts',
        type: 'bar',
        data: totalPosts,
        itemStyle: { color: '#2196F3' }
      },
      {
        name: 'High Relevance',
        type: 'bar',
        data: highRelevance,
        itemStyle: { color: '#FF9800' }
      }
    ]
  }
})

// Platform Table Data
const platformTableData = computed(() => {
  if (!scrapingStats.value.job_statistics) return []
  
  return Object.entries(scrapingStats.value.job_statistics).map(([platform, stats]: [string, any]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    total_jobs: stats.total || 0,
    completed: stats.completed || 0,
    failed: stats.failed || 0,
    results: stats.results || 0,
    completion_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
  }))
})

onMounted(() => {
  fetchData()
})
</script>
