<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Leads</h1>
      <div class="d-flex gap-4">
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-upload"
          @click="$refs.csvInput.click()"
        >
          Upload CSV
          <input
            ref="csvInput"
            type="file"
            accept=".csv"
            style="display: none"
            @change="handleCsvUpload"
          />
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
          Add Lead
        </v-btn>
      </div>
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
      <v-data-table
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
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            @click="editLead(item)"
          />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="deleteLead(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Lead Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingLead ? 'Edit Lead' : 'Add Lead' }}</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid" @submit.prevent="saveLead">
            <v-text-field
              v-model="leadForm.first_name"
              label="First Name"
              required
              :rules="[v => !!v || 'First name is required']"
            />
            <v-text-field
              v-model="leadForm.last_name"
              label="Last Name"
              required
              :rules="[v => !!v || 'Last name is required']"
            />
            <v-text-field
              v-model="leadForm.email"
              label="Email"
              type="email"
              required
              :rules="[
                v => !!v || 'Email is required',
                v => /.+@.+\..+/.test(v) || 'Email must be valid'
              ]"
            />
            <v-text-field
              v-model="leadForm.city"
              label="City"
              required
              :rules="[v => !!v || 'City is required']"
            />
            <v-switch
              v-model="leadForm.unsubscribed"
              label="Unsubscribed"
              color="error"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showAddDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveLead"
          >
            {{ editingLead ? 'Save' : 'Add' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNotificationStore } from '~/stores/notification'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const notificationStore = useNotificationStore()
const loading = ref(false)
const saving = ref(false)
const showAddDialog = ref(false)
const isFormValid = ref(true)
const form = ref(null)
const csvInput = ref(null)
const editingLead = ref(null)

const filters = ref({
  search: '',
  status: '',
  city: ''
})

const leadForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  city: '',
  unsubscribed: false
})

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
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
    filtered = filtered.filter(lead => 
      lead.first_name.toLowerCase().includes(searchTerm) ||
      lead.last_name.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm)
    )
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
    filtered = filtered.filter(lead => 
      lead.city.toLowerCase().includes(cityTerm)
    )
  }

  return filtered
})

onMounted(() => {
  loadLeads()
})

const loadLeads = async () => {
  try {
    loading.value = true
    // Try the original API pattern first
    const response = await fetch(`/api/upload/leads?page=1&per_page=100`)
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      throw new Error('Failed to load leads')
    }
    
    const data = await response.json()
    console.log('Loaded leads data:', data) // Debug log
    
    // Handle different response formats
    if (Array.isArray(data)) {
      leads.value = data
    } else if (data.leads && Array.isArray(data.leads)) {
      leads.value = data.leads
    } else if (data.data && Array.isArray(data.data)) {
      leads.value = data.data
    } else {
      console.warn('Unexpected data format:', data)
      leads.value = []
    }
    
    console.log('Final leads array length:', leads.value.length) // Debug log
  } catch (error) {
    console.error('Failed to load leads:', error)
    notificationStore.error('Failed to load leads')
    leads.value = [] // Ensure leads is always an array
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  // Filters are applied automatically through the computed property
  // This function can be used for any additional filter logic if needed
}

const handleCsvUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    loading.value = true
    const response = await fetch(`/api/upload/csv`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Upload failed')

    // Get updated count
    const countResponse = await fetch(`/api/upload/leads/count`)
    const countData = await countResponse.json()
    
    notificationStore.success(`CSV uploaded successfully. ${countData.count} leads imported.`)
    loadLeads() // Reload the leads list
    
    // Clear input
    if (csvInput.value) {
      csvInput.value.value = ''
    }
  } catch (error) {
    console.error('Upload failed:', error)
    notificationStore.error('Failed to upload CSV')
  } finally {
    loading.value = false
  }
}

const saveLead = async () => {
  if (!isFormValid.value) {
    notificationStore.error('Please fill all required fields')
    return
  }

  try {
    saving.value = true
    const url = editingLead.value
      ? `/api/upload/leads/${editingLead.value.id}`
      : `/api/upload/leads`
    
    const response = await fetch(url, {
      method: editingLead.value ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadForm.value)
    })

    if (!response.ok) throw new Error('Failed to save lead')

    showAddDialog.value = false
    notificationStore.success(`Lead ${editingLead.value ? 'updated' : 'added'} successfully`)
    loadLeads() // Reload the leads list
    
    // Reset form
    leadForm.value = {
      first_name: '',
      last_name: '',
      email: '',
      city: '',
      unsubscribed: false
    }
    editingLead.value = null
  } catch (error) {
    console.error('Failed to save lead:', error)
    notificationStore.error('Failed to save lead')
  } finally {
    saving.value = false
  }
}

const editLead = (lead: any) => {
  editingLead.value = lead
  leadForm.value = {
    first_name: lead.first_name,
    last_name: lead.last_name,
    email: lead.email,
    city: lead.city,
    unsubscribed: lead.unsubscribed
  }
  showAddDialog.value = true
}

const deleteLead = async (lead: any) => {
  if (!confirm('Are you sure you want to delete this lead?')) return

  try {
    loading.value = true
    const response = await fetch(`/api/upload/leads/${lead.id}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Failed to delete lead')

    notificationStore.success('Lead deleted successfully')
    loadLeads() // Reload the leads list
  } catch (error) {
    console.error('Failed to delete lead:', error)
    notificationStore.error('Failed to delete lead')
  } finally {
    loading.value = false
  }
}
</script>