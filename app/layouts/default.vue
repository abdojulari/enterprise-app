<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      permanent
      :rail="!uiStore.isMobile && railMode"
      class="pa-5"
      color="surface"
      elevation="12"
    >
      <!-- Header -->
      <v-list-item class="px-4 py-6">
        <template #prepend>
          <v-avatar color="primary" size="40">
            <v-icon icon="mdi-domain" size="24" />
          </v-avatar>
        </template>
        
        <v-list-item-title class="enterprise-title">
          <span v-show="!railMode || uiStore.isMobile">
            Enterprise App
          </span>
        </v-list-item-title>
      </v-list-item>
      
      <v-divider />
      
      <!-- Navigation Menu -->
      <v-list nav density="compact">
        <template v-for="item in navigationItems" :key="item.title">
          <v-list-item
            v-if="!item.children"
            :exact="item.exact"
            class="nav-item pa-2"
          >
            <template #prepend>
              <v-icon :icon="item.icon" />
            </template>
            
            <v-list-item-title>
              <NuxtLink class="text-decoration-none text-body-1 font-weight-medium" style="color: rgb(var(--v-theme-on-surface));" :to="item.to">{{ item.title }}</NuxtLink>
            </v-list-item-title>
            
            <template #append v-if="item.badge">
              <v-badge
                :content="item.badge"
                color="error"
                inline
              />
            </template>
          </v-list-item>
          
          <!-- Group with children -->
          <v-list-group v-else :value="item.title">
            <template #activator="{ props }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon :icon="item.icon" />
                </template>
                <v-list-item-title>
                  <NuxtLink 
                  class="text-decoration-none text-body-1 font-weight-medium" style="color: rgb(var(--v-theme-on-surface));" :to="item.to">{{ item.title }}</NuxtLink>
                </v-list-item-title>
              </v-list-item>
            </template>
            
            <v-list-item
              v-for="child in item.children"
              :key="child.title"
              class="nav-item pl-8"
            >
              <template #prepend>
                <v-icon :icon="child.icon" size="20" />
              </template>
              <v-list-item-title>
                <NuxtLink 
                  class="text-decoration-none text-body-1 font-weight-medium" 
                  style="color: rgb(var(--v-theme-on-surface));" 
                  :to="child.to"
                >
                  {{ child.title }}
                </NuxtLink>
              </v-list-item-title>
            </v-list-item>
          </v-list-group>
        </template>
      </v-list>
      
      <v-spacer/>
      
      <!-- Bottom Actions -->
      <div class="pa-4">
        <v-btn
          v-if="!uiStore.isMobile"
          title="Toggle Rail Mode"
          :icon="railMode ? 'mdi-menu' : 'mdi-menu-open'"
          variant="text"
          @click="toggleRailMode"
        />
      </div>
    </v-navigation-drawer>
    
    <!-- App Bar -->
    <v-app-bar
      elevation="1"
      color="surface"
      class="enterprise-app-bar"
    >
      <!-- Mobile menu button -->
      <v-app-bar-nav-icon
        v-if="uiStore.isMobile"
        @click="uiStore.toggleDrawer()"
      />
      
      <!-- Breadcrumbs / Title -->
      <v-toolbar-title class="px-4">
        <template v-if="breadcrumbs.length > 0">
          <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0">
            <template #divider>
              <v-icon icon="mdi-chevron-right" size="16" />
            </template>
          </v-breadcrumbs>
        </template>
        <template v-else>
          <span class="text-h6 font-weight-medium">{{ currentPageTitle }}</span>
        </template>
      </v-toolbar-title>

      <v-toolbar-items v-if="!uiStore.isMobile" class="top-nav ml-4">
        <v-btn to="/" variant="text" class="nav-link text-h6" exact>Dashboard</v-btn>
        <v-btn to="/analytics" variant="text" class="nav-link text-h6">Analytics</v-btn>
        <v-btn to="/campaigns" variant="text" class="nav-link text-h6">Campaigns</v-btn>
        <v-btn to="/leads" variant="text" class="nav-link text-h6">Leads</v-btn>
        <v-btn to="/stats" variant="text" class="nav-link text-h6">Stats</v-btn>
        <v-btn to="/enrichment" variant="text" class="nav-link text-h6">Enrichment</v-btn>
        <v-btn to="/reports" variant="text" class="nav-link text-h6">Reports</v-btn>
        <v-btn to="/settings" variant="text" class="nav-link text-h6">Settings</v-btn>
      </v-toolbar-items>
      
      <!-- Search -->
      <v-text-field
        v-if="!uiStore.isMobile"
        v-model="searchQuery"
        placeholder="Search..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        class="mr-4"
        style="max-width: 300px;"
        @keydown.enter="handleSearch"
      />
      
      <!-- Actions -->
      <div class="d-flex align-center">
        <!-- Notifications -->
        <v-btn
          icon="mdi-bell-outline"
          variant="text"
          @click="showNotifications = !showNotifications"
        >
          <v-badge
            v-if="notificationCount > 0"
            :content="notificationCount"
            color="error"
            overlap
          >
            <v-icon icon="mdi-bell-outline" />
          </v-badge>
          <v-icon v-else icon="mdi-bell-outline" />
        </v-btn>
        
        <!-- Theme toggle -->
        <v-btn
          :icon="themeIcon"
          variant="text"
          @click="themeStore.toggleTheme"
        />
        
        <!-- User menu -->
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text">
              <v-avatar size="32" color="primary">
                <v-img
                  v-if="user?.avatar"
                  :src="user.avatar"
                  :alt="user.name"
                />
                <span v-else class="text-body-2">
                  {{ userInitials }}
                </span>
              </v-avatar>
              
              <v-icon icon="mdi-chevron-down" class="ml-2" />
            </v-btn>
          </template>
          
          <v-card min-width="200">
            <v-list>
              <v-list-item class="px-4 py-3">
                <v-list-item-title class="font-weight-medium">
                  {{ user?.name || 'Guest' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ user?.email }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-divider />
              
              <v-list-item to="/profile">
                <template #prepend>
                  <v-icon icon="mdi-account-circle" />
                </template>
                <v-list-item-title>Profile</v-list-item-title>
              </v-list-item>
              
              <v-list-item to="/settings">
                <template #prepend>
                  <v-icon icon="mdi-cog" />
                </template>
                <v-list-item-title>Settings</v-list-item-title>
              </v-list-item>
              
              <v-divider />
              
              <v-list-item @click="handleLogout">
                <template #prepend>
                  <v-icon icon="mdi-logout" color="error" />
                </template>
                <v-list-item-title class="text-error">Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>
    
    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>
    
    <!-- Footer -->
    <v-footer class="enterprise-footer bg-surface pa-5">
      <div class="w-100 d-flex justify-space-between align-center flex-wrap pa-5">
        <div class="text-body-2 text-medium-emphasis">
          © {{ currentYear }} Enterprise App. All rights reserved.
        </div>
        
        <div class="d-flex gap-4 ">
          <NuxtLink to="/privacy" class="text-decoration-none text-body-2">
            Privacy Policy
          </NuxtLink>
          <NuxtLink to="/terms" class="text-decoration-none text-body-2">
            Terms of Service
          </NuxtLink>
        </div>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Breadcrumb } from '~/types'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useNotificationStore } from '~/stores/notification'
import { useUIStore } from '~/stores/ui'

// Pinia stores
const authStore = useAuthStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()
const uiStore = useUIStore()

// Computed properties from stores
const user = computed(() => authStore.currentUser)
const userInitials = computed(() => authStore.userInitials)
const isDark = computed(() => themeStore.isDark)
const themeIcon = computed(() => themeStore.themeIcon)
const navigationItems = computed(() => uiStore.navigationItems)

// UI state from store
const drawer = computed({
  get: () => uiStore.drawer,
  set: (value) => value ? uiStore.openDrawer() : uiStore.closeDrawer()
})

const railMode = computed({
  get: () => uiStore.railMode,
  set: (value) => uiStore.setRailMode(value)
})

const searchQuery = computed({
  get: () => uiStore.searchQuery,
  set: (value) => uiStore.setSearchQuery(value)
})

const showNotifications = computed({
  get: () => uiStore.showNotifications,
  set: (value) => value ? uiStore.toggleNotifications() : uiStore.closeNotifications()
})

const notificationCount = computed(() => notificationStore.notificationCount)

// Other computed properties
const currentYear = computed(() => new Date().getFullYear())

const currentPageTitle = computed(() => {
  const route = useRoute()
  return uiStore.displayedPageTitle || route.meta?.title || route.name || 'Page'
})

const breadcrumbs = computed<Breadcrumb[]>(() => {
  const route = useRoute()
  if (uiStore.breadcrumbs.length > 0) {
    return uiStore.breadcrumbs
  }
  if (!route.meta?.breadcrumbs) return []
  return route.meta.breadcrumbs as Breadcrumb[]
})

// Methods using stores
const toggleRailMode = () => {
  uiStore.toggleRailMode()
}

const handleSearch = () => {
  uiStore.performSearch()
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    notificationStore.success('Logged out successfully')
  } catch (err) {
    notificationStore.error('Logout failed', 'Please try again')
  }
}

// Initialize UI store
onMounted(() => {
  uiStore.initializeUI()
})

// Handle keyboard shortcuts
onMounted(() => {
  if (process.client) {
    document.addEventListener('keydown', uiStore.handleKeyboardShortcuts)
  }
})

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('keydown', uiStore.handleKeyboardShortcuts)
  }
})
</script>

<style scoped>
.top-nav :deep(.nav-link) {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
  text-transform: none;
  text-decoration: none;
}

.top-nav :deep(.router-link-active) {
  color: rgb(var(--v-theme-primary));
}

.enterprise-nav {
  border-right: 1px solid rgb(var(--v-theme-on-surface), 0.12) !important;
}

.enterprise-app-bar {
  border-bottom: 1px solid rgb(var(--v-theme-on-surface), 0.12) !important;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-item {
  margin: 2px 8px;
  border-radius: 8px !important;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: rgb(var(--v-theme-primary), 0.08) !important;
}

.nav-item.router-link-active {
  background-color: rgb(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.enterprise-footer {
  border-top: 1px solid rgb(var(--v-theme-on-surface), 0.12) !important;
  padding: 16px 24px !important;
}

@media (max-width: 599px) {
  .enterprise-footer {
    padding: 12px 16px !important;
  }
  
  .enterprise-footer > div {
    flex-direction: column !important;
    gap: 8px !important;
  }
}
</style>