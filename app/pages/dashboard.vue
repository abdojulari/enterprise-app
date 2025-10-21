<template>
  <div>
    <!-- Stats Overview -->
    <v-row>
      <v-col v-for="(stat, index) in dashboardStore.stats" :key="index" cols="12" sm="6" md="3">
        <v-card class="mb-6 elevation-6" flat >
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-overline mb-1">{{ stat.label }}</p>
                <h3 class="text-h4 font-weight-bold">{{ stat.value }}</h3>
                <p class="text-caption" :class="stat.trend >= 0 ? 'text-success' : 'text-error'">
                  <v-icon size="small" :icon="stat.trend >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'" start />
                  {{ Math.abs(stat.trend) }}% from last week
                </p>
              </div>
              <v-icon :color="stat.color" size="48" :icon="stat.icon" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row class="mt-6">
      <v-col cols="12" md="8">
        <v-card class="mb-6 elevation-6" flat >
          <v-card-title>Campaign Performance</v-card-title>
          <v-card-text>
            <v-chart class="chart" :option="dashboardStore.chartOption" autoresize />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="mb-6 elevation-6" flat >
          <v-card-title>Recent Activity</v-card-title>
          <v-list lines="two">
            <v-list-item v-for="(activity, index) in dashboardStore.recentActivity" :key="index" :subtitle="activity.timestamp">
              <template #prepend>
                <v-avatar :color="activity.color" size="40">
                  <v-icon :icon="activity.icon" color="white" />
                </v-avatar>
              </template>
              <v-list-item-title>{{ activity.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ activity.description }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard'

definePageMeta({
  middleware: 'auth'
})

const dashboardStore = useDashboardStore()

// Fetch real data from API on mount
onMounted(async () => {
  await (dashboardStore as any).fetchDashboardData()
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
