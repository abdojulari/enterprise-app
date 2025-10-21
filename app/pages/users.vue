<template>
  <div class="users-page">
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="enterprise-title mb-2">User Management</h1>
        <p class="enterprise-subtitle">
          Manage users, roles, and permissions across your organization
        </p>
      </div>
      
      <VBtn
        color="primary"
        prepend-icon="mdi-account-plus"
        @click="showCreateDialog = true"
      >
        Add User
      </VBtn>
    </div>

    <!-- Stats Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard class="enterprise-card" color="success" variant="tonal">
          <VCardText class="text-center">
            <VIcon icon="mdi-account-group" size="40" class="mb-2" />
            <div class="text-h4 font-weight-bold">{{ userStats.total }}</div>
            <div class="text-body-2">Total Users</div>
          </VCardText>
        </VCard>
      </VCol>
      
      <VCol cols="12" sm="6" md="3">
        <VCard class="enterprise-card" color="success" variant="tonal">
          <VCardText class="text-center">
            <VIcon icon="mdi-account-check" size="40" class="mb-2" />
            <div class="text-h4 font-weight-bold">{{ userStats.active }}</div>
            <div class="text-body-2">Active Users</div>
          </VCardText>
        </VCard>
      </VCol>
      
      <VCol cols="12" sm="6" md="3">
        <VCard class="enterprise-card" color="warning" variant="tonal">
          <VCardText class="text-center">
            <VIcon icon="mdi-account-clock" size="40" class="mb-2" />
            <div class="text-h4 font-weight-bold">{{ userStats.pending }}</div>
            <div class="text-body-2">Pending</div>
          </VCardText>
        </VCard>
      </VCol>
      
      <VCol cols="12" sm="6" md="3">
        <VCard class="enterprise-card" color="error" variant="tonal">
          <VCardText class="text-center">
            <VIcon icon="mdi-account-off" size="40" class="mb-2" />
            <div class="text-h4 font-weight-bold">{{ userStats.suspended }}</div>
            <div class="text-body-2">Suspended</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Filters and Search -->
    <VCard class="enterprise-card mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="4">
            <VTextField
              v-model="search"
              placeholder="Search users..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </VCol>
          
          <VCol cols="12" sm="6" md="3">
            <VSelect
              v-model="roleFilter"
              :items="roleOptions"
              placeholder="Filter by role"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </VCol>
          
          <VCol cols="12" sm="6" md="3">
            <VSelect
              v-model="statusFilter"
              :items="statusOptions"
              placeholder="Filter by status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </VCol>
          
          <VCol cols="12" md="2">
            <VBtn
              variant="outlined"
              block
              @click="clearFilters"
            >
              Clear Filters
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Bulk Actions -->
    <div v-if="hasSelection" class="mb-4">
      <VCard class="enterprise-card" color="primary" variant="tonal">
        <VCardText class="d-flex align-center justify-space-between">
          <div>
            <strong>{{ selectedUserCount }} users selected</strong>
          </div>
          
          <div class="d-flex gap-2">
            <VBtn
              variant="outlined"
              prepend-icon="mdi-account-check"
              @click="bulkUpdateStatus('active')"
            >
              Activate
            </VBtn>
            
            <VBtn
              variant="outlined"
              prepend-icon="mdi-account-off"
              @click="bulkUpdateStatus('suspended')"
            >
              Suspend
            </VBtn>
            
            <VBtn
              variant="outlined"
              color="error"
              prepend-icon="mdi-delete"
              @click="confirmBulkDelete"
            >
              Delete
            </VBtn>
            
            <VBtn
              variant="text"
              @click="deselectAll"
            >
              Clear Selection
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </div>

    <!-- Users Data Table -->
    <VCard class="enterprise-card">
      <VDataTable
        v-model="selectedUsers"
        :headers="tableHeaders"
        :items="paginatedUsers"
        :loading="loading"
        item-value="id"
        show-select
        class="elevation-0"
        no-data-text="No users found"
      >
        <!-- Avatar and name -->
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar color="primary" size="32" class="mr-3">
              <VImg v-if="item.avatar" :src="item.avatar" :alt="item.name" />
              <span v-else class="text-caption">
                {{ getInitials(item.name) }}
              </span>
            </VAvatar>
            
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>
        
        <!-- Role chip -->
        <template #item.role="{ item }">
          <VChip
            :color="getRoleColor(item.role)"
            size="small"
            variant="tonal"
          >
            {{ item.role }}
          </VChip>
        </template>
        
        <!-- Status chip -->
        <template #item.status="{ item }">
          <VChip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ item.status }}
          </VChip>
        </template>
        
        <!-- Created date -->
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
        
        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center">
            <VBtn
              icon="mdi-eye"
              variant="text"
              size="small"
              @click="viewUser(item)"
            />
            <VBtn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="editUser(item)"
            />
            <VBtn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="confirmDeleteUser(item)"
            />
          </div>
        </template>
      </VDataTable>
      
      <!-- Pagination -->
      <VCardActions>
        <VSpacer />
        <VPagination
          v-model="currentPage"
          :length="totalPages"
          @update:model-value="setPage"
        />
      </VCardActions>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import type { User, UserRole, UserStatus } from '~/types'

// Page meta
definePageMeta({
  middleware: 'auth',
  title: 'Users',
  breadcrumbs: [
    { text: 'Home', to: '/', disabled: false },
    { text: 'Users', disabled: true }
  ]
})

// Pinia stores
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const uiStore = useUIStore()

// Reactive state
const showCreateDialog = ref(false)

// Computed properties from store
const users = computed(() => userStore.filteredUsers)
const paginatedUsers = computed(() => userStore.paginatedUsers)
const loading = computed(() => userStore.loading)
const selectedUsers = computed({
  get: () => userStore.selectedUsers,
  set: (value) => {
    userStore.selectedUsers = value
  }
})
const userStats = computed(() => userStore.userStats)
const totalPages = computed(() => userStore.totalPages)
const selectedUserCount = computed(() => userStore.selectedUserCount)
const hasSelection = computed(() => userStore.hasSelection)

// Filters
const search = computed({
  get: () => userStore.search,
  set: (value) => userStore.setSearch(value)
})

const roleFilter = computed({
  get: () => userStore.filters.role,
  set: (value) => userStore.setRoleFilter(value)
})

const statusFilter = computed({
  get: () => userStore.filters.status,
  set: (value) => userStore.setStatusFilter(value)
})

const currentPage = computed({
  get: () => userStore.pagination.page,
  set: (value) => userStore.setPage(value)
})

// Options for filters
const roleOptions = [
  { title: 'Admin', value: UserRole.ADMIN },
  { title: 'Manager', value: UserRole.MANAGER },
  { title: 'User', value: UserRole.USER },
  { title: 'Moderator', value: UserRole.MODERATOR }
]

const statusOptions = [
  { title: 'Active', value: UserStatus.ACTIVE },
  { title: 'Inactive', value: UserStatus.INACTIVE },
  { title: 'Pending', value: UserStatus.PENDING },
  { title: 'Suspended', value: UserStatus.SUSPENDED }
]

// Table headers
const tableHeaders = [
  { title: 'Name', value: 'name', sortable: true },
  { title: 'Role', value: 'role', sortable: true },
  { title: 'Status', value: 'status', sortable: true },
  { title: 'Created', value: 'createdAt', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false, width: '120px' }
]

// Methods
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getRoleColor = (role: UserRole) => {
  const colors = {
    [UserRole.ADMIN]: 'error',
    [UserRole.MANAGER]: 'warning',
    [UserRole.MODERATOR]: 'info',
    [UserRole.USER]: 'success'
  }
  return colors[role] || 'grey'
}

const getStatusColor = (status: UserStatus) => {
  const colors = {
    [UserStatus.ACTIVE]: 'success',
    [UserStatus.INACTIVE]: 'grey',
    [UserStatus.PENDING]: 'warning',
    [UserStatus.SUSPENDED]: 'error'
  }
  return colors[status] || 'grey'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const clearFilters = () => {
  userStore.clearFilters()
}

const setPage = (page: number) => {
  userStore.setPage(page)
}

const deselectAll = () => {
  userStore.deselectAll()
}

// User actions
const viewUser = (user: User) => {
  notificationStore.info('View User', `Opening details for ${user.name}`)
  // Navigate to user details page
  navigateTo(`/users/${user.id}`)
}

const editUser = (user: User) => {
  notificationStore.info('Edit User', `Opening editor for ${user.name}`)
  // Navigate to user edit page
  navigateTo(`/users/${user.id}/edit`)
}

const confirmDeleteUser = (user: User) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    userStore.deleteUser(user.id)
  }
}

const bulkUpdateStatus = async (status: UserStatus) => {
  if (confirm(`Update status for ${selectedUserCount.value} users?`)) {
    await userStore.bulkUpdateStatus(selectedUsers.value, status)
  }
}

const confirmBulkDelete = async () => {
  if (confirm(`Are you sure you want to delete ${selectedUserCount.value} users?`)) {
    await userStore.bulkDelete(selectedUsers.value)
  }
}

// Initialize
onMounted(async () => {
  uiStore.setPageTitle('User Management')
  await userStore.loadUsers()
})
</script>

<style scoped>
.users-page {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
