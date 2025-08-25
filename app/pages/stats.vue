<template>
  <div>
    <h1 class="text-h4 mb-6">Stats</h1>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
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
        <v-card>
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
import { ref, onMounted } from 'vue'

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

const weeklyStats = ref([
  { metric: 'Total Sends', value: '12,345', change: '+5%' },
  { metric: 'Open Rate', value: '25.4%', change: '-2%' },
  { metric: 'Click Rate', value: '3.2%', change: '+1%' },
  { metric: 'Bounces', value: '0.5%', change: '0%' }
])

const campaignStats = ref([
  { name: 'Welcome Series', sent: '1,234', opens: '45%', clicks: '12%' },
  { name: 'Monthly Newsletter', sent: '5,678', opens: '32%', clicks: '8%' },
  { name: 'Product Update', sent: '3,456', opens: '28%', clicks: '5%' }
])

onMounted(async () => {
  try {
    // TODO: Fetch actual stats from API
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Failed to load stats:', error)
  } finally {
    loading.value = false
  }
})
</script>