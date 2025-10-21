<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="d-flex align-center">
        <h1 class="text-h4">Campaigns</h1>
        <v-btn
          v-if="selectedCampaigns.length > 0"
          color="error"
          variant="text"
          class="ml-4"
          prepend-icon="mdi-delete-outline"
          @click="deleteSelectedCampaigns"
        >
          Delete Selected ({{ selectedCampaigns.length }})
        </v-btn>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showNewDialog = true">
        New Campaign
      </v-btn>
    </div>
    
    <v-card class="mb-6 elevation-6" flat >
      <v-data-table
        v-model="selectedCampaigns"
        :headers="headers"
        :items="campaigns"
        :loading="loading"
        show-select
        item-value="id"
      >
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item?.status)"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.sent_at="{ item }">
          {{ item.sent_at ? new Date(item.sent_at).toLocaleString() : '-' }}
        </template>

        <template #item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleString() }}
        </template>

        <template #item.actions="{ item }">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-send"
                variant="text"
                size="small"
                color="primary"
                :disabled="item.status !== 'draft'"
                v-bind="props"
              />
            </template>
            <v-list>
              <v-list-item @click="showTestSendDialog(item)">
                <template v-slot:prepend>
                  <v-icon icon="mdi-test-tube" color="info" />
                </template>
                <v-list-item-title>Test Send</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sendCampaign(item)">
                <template v-slot:prepend>
                  <v-icon icon="mdi-send" color="primary" />
                </template>
                <v-list-item-title>Send Campaign</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn
            icon="mdi-chart-box"
            variant="text"
            size="small"
            color="info"
            :disabled="item.status === 'draft'"
            @click="viewStats(item)"
          />
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            @click="editCampaign(item)"
          />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="handleDeleteCampaign(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- New/Edit Campaign Dialog -->
    <v-dialog v-model="showNewDialog" max-width="800">
      <v-card>
        <v-card-title>{{ editingCampaign ? 'Edit Campaign' : 'New Campaign' }}</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid" @submit.prevent="saveCampaign">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="campaignForm.name"
                  label="Campaign Name"
                  required
                  :rules="[v => !!v || 'Name is required']"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="campaignForm.subject"
                  label="Email Subject"
                  required
                  :rules="[v => !!v || 'Subject is required']"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="campaignForm.city_filter"
                  label="City Filter"
                  placeholder="e.g., Toronto (leave empty for all cities)"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="campaignForm.rate_limit_per_minute"
                  label="Rate Limit (emails per minute)"
                  type="number"
                  min="1"
                  max="100"
                  :rules="[
                    v => !!v || 'Rate limit is required',
                    v => v > 0 || 'Must be greater than 0',
                    v => v <= 100 || 'Must not exceed 100'
                  ]"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="campaignForm.template"
                  label="Email Template"
                  rows="10"
                  :hint="templateHint"
                  persistent-hint
                  :rules="[v => !!v || 'Template is required']"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showNewDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveCampaign"
          >
            {{ editingCampaign ? 'Save' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Test Send Dialog -->
    <v-dialog v-model="showTestDialog" max-width="500">
      <v-card>
        <v-card-title>Test Campaign</v-card-title>
        <v-card-text>
          <p class="mb-4">Send a test email to verify your campaign content.</p>
          <v-text-field
            v-model="testEmail"
            label="Test Email Address"
            type="email"
            :rules="[
              v => !!v || 'Email is required',
              v => /.+@.+\..+/.test(v) || 'Email must be valid'
            ]"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showTestDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="sending"
            @click="sendTestEmail"
          >
            Send Test
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Campaign Stats Dialog -->
    <v-dialog v-model="showStatsDialog" max-width="800">
      <v-card class="mb-6 elevation-6" flat >
        <v-card-title>Campaign Statistics</v-card-title>
        <v-card-text v-if="campaignStats">
          <v-row>
            <v-col cols="12" md="3">
              <v-card>
                <v-card-text class="text-center">
                  <div class="text-h6">Sent</div>
                  <div class="text-h4">{{ campaignStats.successful_sends }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <v-card>
                <v-card-text class="text-center">
                  <div class="text-h6">Opens</div>
                  <div class="text-h4">{{ campaignStats.open_rate }}%</div>
                  <div class="text-caption">{{ campaignStats.opens }} opens</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <v-card>
                <v-card-text class="text-center">
                  <div class="text-h6">Clicks</div>
                  <div class="text-h4">{{ campaignStats.click_rate }}%</div>
                  <div class="text-caption">{{ campaignStats.clicks }} clicks</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <v-card>
                <v-card-text class="text-center">
                  <div class="text-h6">Unsubscribes</div>
                  <div class="text-h4">{{ campaignStats.unsubscribe_rate }}%</div>
                  <div class="text-caption">{{ campaignStats.unsubscribes }} unsubscribes</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            variant="text"
            @click="showStatsDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const {
  getCampaigns,
  createCampaign,
  deleteCampaign,
  sendCampaignToAll,
  sendTestCampaign,
  getCampaignStats,
  deleteCampaignsBulk,
  getLeadCount
} = useEmailAutomation()

const loading = ref(false)
const saving = ref(false)
const showNewDialog = ref(false)
const showStatsDialog = ref(false)
const showTestDialog = ref(false)
const isFormValid = ref(true)
const form = ref(null)
const editingCampaign = ref(null)
const campaignStats = ref(null)
const testEmail = ref('')
const sending = ref(false)
const testingCampaign = ref(null)

const defaultTemplate = `<h2>Hi {{ first_name }},</h2>

<p>I hope this email finds you well. I'm reaching out because I noticed you're based in {{ city }} and thought you might be interested in some exciting real estate opportunities in your area.</p>

<p>Our AI-powered platform has identified several properties that match what successful investors in {{ city }} are looking for:</p>

<ul>
    <li>🏠 High-growth potential neighborhoods</li>
    <li>📈 Properties with strong rental yields</li>
    <li>💰 Below-market opportunities</li>
</ul>

<p>Would you be interested in a quick 15-minute call to discuss how we can help you find your next investment property in {{ city }}?</p>

<p>Best regards,<br>
<strong>Your Real Estate Team</strong></p>`

const campaignForm = ref({
  name: '',
  subject: '',
  city_filter: '',
  template: defaultTemplate,
  rate_limit_per_minute: 60
})

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Subject', key: 'subject' },
  { title: 'Status', key: 'status' },
  { title: 'City Filter', key: 'city_filter' },
  { title: 'Sent At', key: 'sent_at' },
  { title: 'Created', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const campaigns = ref([])

const templateHint = computed(() => {
  return 'Available variables: {{ first_name }}, {{ last_name }}, {{ city }}. HTML is supported.'
})

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'success'
    case 'draft': return 'warning'
    case 'sending': return 'info'
    case 'completed': return 'primary'
    case 'failed': return 'error'
    default: return 'grey'
  }
}

onMounted(async () => {
  await loadCampaigns()
})

const loadCampaigns = async () => {
  try {
    loading.value = true
    campaigns.value = await getCampaigns()
  } catch (error: any) {
    console.error('Failed to load campaigns:', error)
    notificationStore.error('Failed to load campaigns')
    campaigns.value = []
  } finally {
    loading.value = false
  }
}

const saveCampaign = async () => {
  if (!isFormValid.value) {
    notificationStore.error('Please fill all required fields')
    return
  }

  try {
    saving.value = true
    await createCampaign({
      name: campaignForm.value.name,
      subject: campaignForm.value.subject,
      city_filter: campaignForm.value.city_filter || null,
      template: campaignForm.value.template
    })

    await loadCampaigns()
    showNewDialog.value = false
    notificationStore.success('Campaign created successfully')
    
    // Reset form
    campaignForm.value = {
      name: '',
      subject: '',
      city_filter: '',
      template: defaultTemplate,
      rate_limit_per_minute: 60
    }
    editingCampaign.value = null
  } catch (error: any) {
    console.error('Failed to save campaign:', error)
    notificationStore.error('Failed to save campaign')
  } finally {
    saving.value = false
  }
}

const sendCampaign = async (campaign: any) => {
  if (!confirm('This will send the campaign to ALL matching leads. Have you tested it first?')) return

  try {
    loading.value = true
    console.log('Sending campaign to all leads:', campaign.id)
    
    // Get lead count first
    const leadsData = await getLeadCount()
    
    if (!confirm(`This will send to ${leadsData.count} leads. Are you sure?`)) {
      loading.value = false
      return
    }
    
    const result = await sendCampaignToAll(campaign.id, campaign.city_filter || undefined)
    console.log('Send response:', result)
    
    // Check initial stats
    const stats = await getCampaignStats(campaign.id)
    
    if (stats.successful_sends > 0) {
      notificationStore.success('Campaign started sending successfully')
    } else {
      notificationStore.warning('Campaign queued but delivery pending. Please check with your administrator.')
    }
    
    // Reload campaigns and check stats again after delay
    await loadCampaigns()
    setTimeout(async () => {
      const updatedStats = await getCampaignStats(campaign.id)
      
      if (updatedStats.successful_sends > 0) {
        notificationStore.success(`Campaign sending: ${updatedStats.successful_sends} emails delivered`)
      }
      
      await loadCampaigns()
      await viewStats(campaign)
    }, 5000)
  } catch (error: any) {
    console.error('Failed to send campaign:', error)
    notificationStore.error('Failed to send campaign')
  } finally {
    loading.value = false
  }
}

const viewStats = async (campaign: any) => {
  try {
    loading.value = true
    campaignStats.value = await getCampaignStats(campaign.id)
    showStatsDialog.value = true
  } catch (error: any) {
    console.error('Failed to load campaign stats:', error)
    notificationStore.error('Failed to load campaign stats')
  } finally {
    loading.value = false
  }
}

const editCampaign = (campaign: any) => {
  editingCampaign.value = campaign
  campaignForm.value = {
    name: campaign.name,
    subject: campaign.subject,
    city_filter: campaign.city_filter || '',
    template: campaign.template || defaultTemplate,
    rate_limit_per_minute: 60
  }
  showNewDialog.value = true
}

const showTestSendDialog = (campaign: any) => {
  testingCampaign.value = campaign
  testEmail.value = ''
  showTestDialog.value = true
}

const sendTestEmail = async () => {
  if (!testEmail.value || !/.+@.+\..+/.test(testEmail.value)) {
    notificationStore.error('Please enter a valid email address')
    return
  }

  try {
    sending.value = true
    console.log('Sending test email:', {
      campaignId: testingCampaign.value.id,
      email: testEmail.value,
      cityFilter: testingCampaign.value.city_filter
    })
    
    // Send test preview using the test endpoint
    const data = await sendTestCampaign(testingCampaign.value.id, testEmail.value)
    console.log('Test send response:', data)
    
    notificationStore.success(`Preview sent to ${testEmail.value} using sample data: ${data.sample_data.first_name} ${data.sample_data.last_name} from ${data.sample_data.city}`)
    notificationStore.info('This is just a preview. Use "Send Campaign" when ready to send to actual leads.')
    showTestDialog.value = false
  } catch (error: any) {
    console.error('Failed to send test email:', error)
    notificationStore.error('Failed to send test email: ' + error.message)
  } finally {
    sending.value = false
  }
}

const selectedCampaigns = ref<number[]>([])

const handleDeleteCampaign = async (campaign: any) => {
  if (!confirm('Are you sure you want to delete this campaign?')) return

  try {
    loading.value = true
    await deleteCampaign(campaign.id)
    await loadCampaigns()
    notificationStore.success('Campaign deleted successfully')
  } catch (error: any) {
    console.error('Failed to delete campaign:', error)
    notificationStore.error('Failed to delete campaign')
  } finally {
    loading.value = false
  }
}

const deleteSelectedCampaigns = async () => {
  if (selectedCampaigns.value.length === 0) {
    notificationStore.warning('Please select campaigns to delete')
    return
  }

  const count = selectedCampaigns.value.length
  if (!confirm(`Are you sure you want to delete ${count} campaigns?`)) return

  try {
    loading.value = true
    await deleteCampaignsBulk(selectedCampaigns.value)
    await loadCampaigns()
    selectedCampaigns.value = []
    notificationStore.success(`${count} campaigns deleted successfully`)
  } catch (error: any) {
    console.error('Failed to delete campaigns:', error)
    notificationStore.error('Failed to delete campaigns')
  } finally {
    loading.value = false
  }
}
</script>