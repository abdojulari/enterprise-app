<template>
  <div>
    <h1 class="text-h4 mb-6">Social Media Scraping</h1>

    <!-- Scraping Controls -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Keyword Scraping</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleKeywordScraping">
              <v-select
                v-model="keywordForm.platform"
                label="Platform"
                :items="platforms"
                item-title="text"
                item-value="value"
                :rules="[v => !!v || 'Platform is required']"
                variant="outlined"
                density="compact"
                class="mb-3"
              />
              
              <v-combobox
                v-model="keywordForm.keywords"
                label="Keywords"
                placeholder="Press enter to add keywords"
                multiple
                chips
                closable-chips
                :rules="[v => v && v.length > 0 || 'At least one keyword is required']"
                variant="outlined"
                density="compact"
                class="mb-3"
              />

              <v-text-field
                v-model="keywordForm.location"
                label="Location (optional)"
                placeholder="Edmonton, AB"
                variant="outlined"
                density="compact"
                class="mb-3"
              />

              <v-text-field
                v-model.number="keywordForm.limit"
                label="Limit"
                type="number"
                variant="outlined"
                density="compact"
                :rules="[v => !v || (v > 0 && v <= 100) || 'Limit must be between 1 and 100']"
                class="mb-3"
              />

              <v-btn
                color="primary"
                :loading="keywordScraping"
                @click="handleKeywordScraping"
                block
              >
                <v-icon left>mdi-magnify</v-icon>
                Start Scraping
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>User Profile Scraping</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleUserScraping">
              <v-select
                v-model="userForm.platform"
                label="Platform"
                :items="platforms"
                item-title="text"
                item-value="value"
                :rules="[v => !!v || 'Platform is required']"
                variant="outlined"
                density="compact"
                class="mb-3"
              />

              <v-text-field
                v-model="userForm.username"
                label="Username"
                placeholder="Enter username"
                :rules="[v => !!v || 'Username is required']"
                variant="outlined"
                density="compact"
                class="mb-3"
              />

              <v-text-field
                v-model.number="userForm.limit"
                label="Limit"
                type="number"
                variant="outlined"
                density="compact"
                :rules="[v => !v || (v > 0 && v <= 100) || 'Limit must be between 1 and 100']"
                class="mb-3"
              />

              <v-btn
                color="primary"
                :loading="userScraping"
                @click="handleUserScraping"
                block
              >
                <v-icon left>mdi-account-search</v-icon>
                Scrape User
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3" v-for="platform in platforms" :key="platform.value">
                <v-btn
                  color="secondary"
                  variant="outlined"
                  :loading="trendingScraping[platform.value]"
                  @click="handleTrendingScraping(platform.value)"
                  block
                >
                  <v-icon left>{{ platform.icon }}</v-icon>
                  {{ platform.text }} Trending
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Scraping Jobs -->
    <v-card class="mt-6">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Scraping Jobs</span>
        <v-btn
          icon="mdi-refresh"
          variant="text"
          size="small"
          @click="loadScrapingJobs"
          :loading="jobsLoading"
        />
      </v-card-title>
      <v-data-table
        :headers="jobHeaders"
        :items="scrapingJobs"
        :loading="jobsLoading"
        items-per-page="10"
        density="compact"
      >
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.started_at="{ item }">
          {{ formatDate(item.started_at) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            variant="text"
            size="small"
            @click="viewJobDetails(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Social Posts -->
    <v-card class="mt-6">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Scraped Posts ({{ socialPosts.length }})</span>
        <v-btn
          icon="mdi-refresh"
          variant="text"
          size="small"
          @click="loadSocialPosts"
          :loading="postsLoading"
        />
      </v-card-title>
      <v-data-table
        :headers="postHeaders"
        :items="socialPosts"
        :loading="postsLoading"
        items-per-page="10"
        density="compact"
      >
        <template #item.title="{ item }">
          <div class="text-truncate" style="max-width: 300px;">
            {{ item.title || item.content.substring(0, 50) + '...' }}
          </div>
        </template>

        <template #item.platform="{ item }">
          <v-chip size="small" variant="outlined">
            {{ item.platform }}
          </v-chip>
        </template>

        <template #item.engagement_score="{ item }">
          <v-rating
            :model-value="Math.min(item.engagement_score / 20, 5)"
            readonly
            size="small"
            density="compact"
          />
        </template>

        <template #item.contact_info="{ item }">
          <div class="d-flex gap-1">
            <v-chip v-if="extractEmail(item.content)" size="x-small" color="primary" variant="outlined">
              <v-icon start size="x-small">mdi-email</v-icon>
              Email
            </v-chip>
            <v-chip v-if="extractPhone(item.content)" size="x-small" color="success" variant="outlined">
              <v-icon start size="x-small">mdi-phone</v-icon>
              Phone
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            variant="text"
            size="small"
            @click="viewPostDetails(item)"
            class="mr-1"
          />
          <v-btn
            icon="mdi-open-in-new"
            variant="text"
            size="small"
            :href="item.url"
            target="_blank"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Job Details Dialog -->
    <v-dialog v-model="showJobDialog" max-width="600">
      <v-card v-if="selectedJob">
        <v-card-title>Job Details</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Job ID</v-list-item-title>
              <template #append>
                <span class="text-medium-emphasis">{{ selectedJob.id }}</span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Platform</v-list-item-title>
              <template #append>
                <v-chip size="small">{{ selectedJob.platform }}</v-chip>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Job Type</v-list-item-title>
              <template #append>
                <span class="text-medium-emphasis">{{ selectedJob.job_type }}</span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Status</v-list-item-title>
              <template #append>
                <v-chip :color="getStatusColor(selectedJob.status)" size="small">
                  {{ selectedJob.status }}
                </v-chip>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Results Count</v-list-item-title>
              <template #append>
                <span class="text-medium-emphasis">{{ selectedJob.results_count }}</span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Started At</v-list-item-title>
              <template #append>
                <span class="text-medium-emphasis">{{ formatDate(selectedJob.started_at) }}</span>
              </template>
            </v-list-item>
            <v-list-item v-if="selectedJob.completed_at">
              <v-list-item-title>Completed At</v-list-item-title>
              <template #append>
                <span class="text-medium-emphasis">{{ formatDate(selectedJob.completed_at) }}</span>
              </template>
            </v-list-item>
            <v-list-item v-if="selectedJob.error_message">
              <v-list-item-title>Error Message</v-list-item-title>
              <v-list-item-subtitle class="text-error">
                {{ selectedJob.error_message }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />
          
          <div>
            <h3 class="text-h6 mb-2">Parameters</h3>
            <pre class="bg-grey-lighten-4 pa-3 rounded">{{ JSON.stringify(selectedJob.parameters, null, 2) }}</pre>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showJobDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Post Details Dialog -->
    <v-dialog v-model="showPostDialog" max-width="800" scrollable>
      <v-card v-if="selectedPost">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Post Details</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="showPostDialog = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <!-- Contact Information -->
          <v-alert v-if="extractEmail(selectedPost.content) || extractPhone(selectedPost.content)" 
                   color="success" 
                   variant="tonal" 
                   class="mb-4">
            <div class="text-h6 mb-3">
              <v-icon start>mdi-account-details</v-icon>
              Extracted Contact Information
            </div>
            <v-list density="compact" class="bg-transparent">
              <v-list-item v-if="extractEmail(selectedPost.content)">
                <template #prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ extractEmail(selectedPost.content) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="extractPhone(selectedPost.content)">
                <template #prepend>
                  <v-icon>mdi-phone</v-icon>
                </template>
                <v-list-item-title>Phone</v-list-item-title>
                <v-list-item-subtitle>{{ extractPhone(selectedPost.content) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>Author</v-list-item-title>
                <v-list-item-subtitle>{{ selectedPost.author_username }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-alert>

          <!-- Post Info -->
          <div class="mb-4">
            <h3 class="text-h6 mb-2">{{ selectedPost.title || 'Untitled Post' }}</h3>
            <div class="d-flex gap-2 mb-2">
              <v-chip size="small" variant="outlined">
                <v-icon start>mdi-account</v-icon>
                {{ selectedPost.author_username }}
              </v-chip>
              <v-chip size="small" color="primary" variant="outlined">
                {{ selectedPost.platform }}
              </v-chip>
              <v-chip v-if="selectedPost.location" size="small" variant="outlined">
                <v-icon start>mdi-map-marker</v-icon>
                {{ selectedPost.location }}
              </v-chip>
            </div>
          </div>

          <v-divider class="my-4" />

          <!-- Content -->
          <div>
            <h4 class="text-subtitle-1 mb-2">Post Content</h4>
            <div class="bg-grey-lighten-4 pa-4 rounded" style="white-space: pre-wrap; max-height: 400px; overflow-y: auto;">
              {{ selectedPost.content }}
            </div>
          </div>

          <!-- Metadata -->
          <v-divider class="my-4" />
          <div class="d-flex flex-wrap gap-4">
            <div>
              <div class="text-caption text-grey">Post Date</div>
              <div class="text-body-2">{{ formatDate(selectedPost.post_date) }}</div>
            </div>
            <div>
              <div class="text-caption text-grey">Engagement Score</div>
              <div class="text-body-2">{{ selectedPost.engagement_score }}</div>
            </div>
            <div v-if="selectedPost.keywords_matched && selectedPost.keywords_matched.length > 0">
              <div class="text-caption text-grey">Keywords Matched</div>
              <div class="d-flex gap-1 mt-1">
                <v-chip v-for="keyword in selectedPost.keywords_matched" 
                        :key="keyword" 
                        size="x-small" 
                        color="primary">
                  {{ keyword }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn
            variant="text"
            prepend-icon="mdi-open-in-new"
            :href="selectedPost.url"
            target="_blank"
          >
            View Original
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="showPostDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useEmailAutomation, type ScrapingJob, type SocialPost } from '~/composables/useEmailAutomation'
import { useNotificationStore } from '~/stores/notification'

definePageMeta({
  middleware: 'auth'
})

const { 
  scrapeKeywords, 
  scrapeUser, 
  scrapeTrending,
  getScrapingJobs,
  getSocialPosts
} = useEmailAutomation()

const notificationStore = useNotificationStore()

// Platform options
const platforms = [
  { text: 'Reddit', value: 'reddit', icon: 'mdi-reddit' },
  { text: 'Twitter', value: 'twitter', icon: 'mdi-twitter' },
  { text: 'Kijiji', value: 'kijiji', icon: 'mdi-shopping' },
  { text: 'Google', value: 'google', icon: 'mdi-google' }
]

// Forms
const keywordForm = reactive({
  platform: 'kijiji',
  keywords: ['FSBO', 'for sale by owner'],
  location: '',
  limit: 20
})

const userForm = reactive({
  platform: 'reddit',
  username: '',
  limit: 20
})

// Loading states
const keywordScraping = ref(false)
const userScraping = ref(false)
const trendingScraping = reactive<Record<string, boolean>>({
  reddit: false,
  twitter: false,
  kijiji: false,
  google: false
})
const jobsLoading = ref(false)
const postsLoading = ref(false)

// Data
const scrapingJobs = ref<ScrapingJob[]>([])
const socialPosts = ref<SocialPost[]>([])
const selectedJob = ref<ScrapingJob | null>(null)
const selectedPost = ref<SocialPost | null>(null)
const showJobDialog = ref(false)
const showPostDialog = ref(false)

// Table headers
const jobHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Platform', key: 'platform' },
  { title: 'Type', key: 'job_type' },
  { title: 'Status', key: 'status' },
  { title: 'Results', key: 'results_count' },
  { title: 'Started', key: 'started_at' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const postHeaders = [
  { title: 'Title', key: 'title' },
  { title: 'Author', key: 'author_username' },
  { title: 'Platform', key: 'platform' },
  { title: 'Engagement', key: 'engagement_score' },
  { title: 'Contact Info', key: 'contact_info' },
  { title: 'Actions', key: 'actions', sortable: false }
]

onMounted(() => {
  loadScrapingJobs()
  loadSocialPosts()
})

const handleKeywordScraping = async () => {
  if (!keywordForm.platform || !keywordForm.keywords || keywordForm.keywords.length === 0) {
    notificationStore.error('Please fill in all required fields')
    return
  }

  try {
    keywordScraping.value = true
    const result = await scrapeKeywords({
      platform: keywordForm.platform as any,
      keywords: keywordForm.keywords,
      location: keywordForm.location || undefined,
      limit: keywordForm.limit || 20
    })
    
    notificationStore.success(`Scraping job started! Job ID: ${result.job_id}`)
    
    // Refresh jobs list after a short delay
    setTimeout(() => {
      loadScrapingJobs()
    }, 1000)
  } catch (error: any) {
    console.error('Keyword scraping failed:', error)
    notificationStore.error(error.message || 'Failed to start keyword scraping')
  } finally {
    keywordScraping.value = false
  }
}

const handleUserScraping = async () => {
  if (!userForm.platform || !userForm.username) {
    notificationStore.error('Please fill in all required fields')
    return
  }

  try {
    userScraping.value = true
    const result = await scrapeUser({
      platform: userForm.platform as any,
      username: userForm.username,
      limit: userForm.limit || 20
    })
    
    notificationStore.success(`User scraping job started! Job ID: ${result.job_id}`)
    
    // Refresh jobs list after a short delay
    setTimeout(() => {
      loadScrapingJobs()
    }, 1000)
  } catch (error: any) {
    console.error('User scraping failed:', error)
    notificationStore.error(error.message || 'Failed to start user scraping')
  } finally {
    userScraping.value = false
  }
}

const handleTrendingScraping = async (platform: string) => {
  try {
    trendingScraping[platform] = true
    const result = await scrapeTrending(platform)
    
    notificationStore.success(`Trending scraping started for ${platform}! Job ID: ${result.job_id}`)
    
    // Refresh jobs list after a short delay
    setTimeout(() => {
      loadScrapingJobs()
    }, 1000)
  } catch (error: any) {
    console.error('Trending scraping failed:', error)
    notificationStore.error(error.message || 'Failed to start trending scraping')
  } finally {
    trendingScraping[platform] = false
  }
}

const loadScrapingJobs = async () => {
  try {
    jobsLoading.value = true
    scrapingJobs.value = await getScrapingJobs()
  } catch (error: any) {
    console.error('Failed to load scraping jobs:', error)
    notificationStore.error('Failed to load scraping jobs')
    scrapingJobs.value = []
  } finally {
    jobsLoading.value = false
  }
}

const loadSocialPosts = async () => {
  try {
    postsLoading.value = true
    const posts = await getSocialPosts(50)
    // Transform posts to handle backend field mismatches
    socialPosts.value = posts.map((post: any) => ({
      ...post,
      post_id: post.post_id || `${post.platform}_${post.id}`,
      engagement_score: post.engagement_score ?? post.relevance_score ?? 0,
      keywords_matched: post.keywords_matched || []
    }))
  } catch (error: any) {
    console.error('Failed to load social posts:', error)
    notificationStore.error('Failed to load social posts')
    socialPosts.value = []
  } finally {
    postsLoading.value = false
  }
}

const viewJobDetails = (job: ScrapingJob) => {
  selectedJob.value = job
  showJobDialog.value = true
}

const viewPostDetails = (post: SocialPost) => {
  selectedPost.value = post
  showPostDialog.value = true
}

const extractEmail = (content: string): string | null => {
  if (!content) return null
  // Email regex pattern
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/i
  const match = content.match(emailRegex)
  return match ? match[0] : null
}

const extractPhone = (content: string): string | null => {
  if (!content) return null
  // Phone regex patterns for North American formats
  const phoneRegex = /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/
  const match = content.match(phoneRegex)
  return match ? match[0].trim() : null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'running':
      return 'primary'
    case 'failed':
      return 'error'
    default:
      return 'grey'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}
</script>

