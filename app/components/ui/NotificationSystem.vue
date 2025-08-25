<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <v-alert
          v-for="notification in notifications"
          :key="notification.id"
          :type="notification.type"
          :title="notification.title"
          :text="notification.message"
          closable
          class="notification-item enterprise-card"
          elevation="6"
          @click:close="remove(notification.id)"
        >
          <!-- Custom actions -->
          <template #actions v-if="notification.actions?.length">
            <div class="d-flex gap-2 mt-2">
              <v-btn
                v-for="action in notification.actions"
                :key="action.text"
                :color="action.color || 'primary'"
                variant="text"
                size="small"
                @click="action.action"
              >
                {{ action.text }}
              </v-btn>
            </div>
          </template>
        </v-alert>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
// Use Pinia store instead of composable
const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.activeNotifications)

const remove = (id: string) => {
  notificationStore.remove(id)
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  width: calc(100vw - 40px);
  pointer-events: none;
}

.notification-item {
  margin-bottom: 12px;
  pointer-events: auto;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

/* Transition animations */
.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Mobile responsive */
@media (max-width: 599px) {
  .notification-container {
    top: 70px;
    right: 16px;
    left: 16px;
    width: auto;
    max-width: none;
  }
}
</style>
