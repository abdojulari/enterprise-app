<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Social Media Leads</h1>
      <v-chip color="info" variant="outlined">
        <v-icon start>mdi-account-multiple</v-icon>
        {{ leads.length }} leads from social scraping
      </v-chip>
    </div>

    <!-- Search and Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              label="Search leads"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              clearable
              @update:model-value="applyFilters"
              @click:clear="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.status"
              label="Status"
              :items="[
                { title: 'All', value: '' },
                { title: 'Active', value: 'active' },
                { title: 'Unsubscribed', value: 'unsubscribed' }
              ]"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.city"
              label="City"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="applyFilters"
              @click:clear="applyFilters"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <v-card>
      <!-- Empty state when no valid leads -->
      <v-card-text v-if="!loading && leads.length === 0" class="text-center py-12">
        <v-icon size="64" color="grey">mdi-account-search</v-icon>
        <h3 class="text-h6 mt-4 mb-2">No leads found</h3>
        <p class="text-grey">
          No leads with complete information (name and email) were found from social media scraping.
        </p>
        <v-btn color="primary" class="mt-4" to="/scraping" prepend-icon="mdi-radar">
          Start Social Scraping
        </v-btn>
      </v-card-text>

      <v-data-table
        v-else
        :headers="headers"
        :items="filteredLeads"
        :loading="loading"
        items-per-page="10"
        density="compact"
        variant="outlined"
      >
        <template #item.name="{ item }">
          {{ item.first_name }} {{ item.last_name }}
        </template>

        <template #item.phone="{ item }">
          <span v-if="item.phone" class="text-body-2">{{ item.phone }}</span>
          <span v-else class="text-grey text-caption">N/A</span>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="item.unsubscribed ? 'error' : 'success'"
            size="small"
          >
            {{ item.unsubscribed ? 'Unsubscribed' : 'Active' }}
          </v-chip>
        </template>

        <template #item.created="{ item }">
          {{ new Date(item.created_at).toLocaleDateString() }}
        </template>

        <template #item.actions="{ item }">
          <v-chip 
            size="small" 
            variant="outlined"
            :color="item.contacted_at ? 'success' : 'default'"
          >
            {{ item.contacted_at ? 'Contacted' : 'New' }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNotificationStore } from '~/stores/notification'
import { useEmailAutomation } from '~/composables/useEmailAutomation'

definePageMeta({
  middleware: 'auth'
})

const notificationStore = useNotificationStore()
const loading = ref(false)

const filters = ref({
  search: '',
  status: '',
  city: ''
})

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Status', key: 'status' },
  { title: 'City', key: 'city' },
  { title: 'Created', key: 'created' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const leads = ref([])

// Computed property for filtered leads
const filteredLeads = computed(() => {
  let filtered = [...leads.value]

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    filtered = filtered.filter(lead => {
      const firstName = lead.first_name?.toLowerCase() || ''
      const lastName = lead.last_name?.toLowerCase() || ''
      const email = lead.email?.toLowerCase() || ''
      const name = lead.name?.toLowerCase() || ''
      
      return firstName.includes(searchTerm) ||
             lastName.includes(searchTerm) ||
             email.includes(searchTerm) ||
             name.includes(searchTerm)
    })
  }

  // Apply status filter
  if (filters.value.status) {
    if (filters.value.status === 'active') {
      filtered = filtered.filter(lead => !lead.unsubscribed)
    } else if (filters.value.status === 'unsubscribed') {
      filtered = filtered.filter(lead => lead.unsubscribed)
    }
  }

  // Apply city filter
  if (filters.value.city) {
    const cityTerm = filters.value.city.toLowerCase()
    filtered = filtered.filter(lead => {
      const city = lead.city?.toLowerCase() || ''
      return city.includes(cityTerm)
    })
  }

  return filtered
})

onMounted(() => {
  loadLeads()
})

const loadLeads = async () => {
  try {
    loading.value = true
    
    // Use the email automation composable to get social leads
    const { getSocialLeads } = useEmailAutomation()
    const data = await getSocialLeads()
    
    console.log('Raw API response:', data) // Debug log
    
    // Extract array from response
    let rawLeads = []
    if (Array.isArray(data)) {
      rawLeads = data
    } else if (data.leads && Array.isArray(data.leads)) {
      rawLeads = data.leads
    } else if (data.data && Array.isArray(data.data)) {
      rawLeads = data.data
    } else {
      console.warn('Unexpected data format:', data)
      rawLeads = []
    }
    
    // Filter out incomplete leads - only keep leads with essential data
    const validLeads = rawLeads.filter(lead => {
      const hasName = (lead.first_name && lead.last_name) || lead.name || lead.full_name
      const hasEmail = lead.email && lead.email.includes('@')
      return hasName && hasEmail
    })
    
    console.log(`Filtered ${validLeads.length} valid leads from ${rawLeads.length} total`)
    
    if (validLeads.length === 0 && rawLeads.length > 0) {
      notificationStore.info(`Found ${rawLeads.length} leads, but none have complete name and email information`)
    }
    
    leads.value = validLeads
  } catch (error) {
    console.error('Failed to load leads:', error)
    notificationStore.error('Failed to load leads')
    leads.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  // Filters are applied automatically through the computed property
  // This function can be used for any additional filter logic if needed
}
</script>