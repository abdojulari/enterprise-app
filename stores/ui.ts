import { defineStore } from 'pinia'
import type { Breadcrumb, MenuItem } from '~/types'

interface UIState {
  // Navigation
  drawer: boolean
  railMode: boolean
  
  // Loading
  globalLoading: boolean
  loadingText: string
  
  // Search
  searchQuery: string
  showSearchResults: boolean
  
  // Notifications
  showNotifications: boolean
  
  // Breadcrumbs
  breadcrumbs: Breadcrumb[]
  
  // Page meta
  pageTitle: string
  
  // Mobile detection
  isMobile: boolean
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    drawer: false,
    railMode: false,
    globalLoading: false,
    loadingText: 'Loading...',
    searchQuery: '',
    showSearchResults: false,
    showNotifications: false,
    breadcrumbs: [],
    pageTitle: '',
    isMobile: false,
  }),

  getters: {
    // Navigation items - could be moved to a separate navigation store if it gets complex
    navigationItems: () => {
      const authStore = useAuthStore()
      
      const baseItems: MenuItem[] = [
        {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          to: '/',
          exact: true
        },
        {
          title: 'Analytics',
          icon: 'mdi-chart-line',
          to: '/analytics'
        },
        {
          title: 'Marketing',
          icon: 'mdi-bullhorn',
          children: [
            { title: 'Campaigns', icon: 'mdi-email-send', to: '/campaigns' },
            { title: 'Leads', icon: 'mdi-account-multiple', to: '/leads' },
            { title: 'Stats', icon: 'mdi-chart-areaspline', to: '/stats' },
            { title: 'Enrichment', icon: 'mdi-database-search', to: '/enrichment' },
          ]
        }
      ]
      
      // Add management section for admins/managers
      if (authStore.hasRole(['admin', 'manager'])) {
        baseItems.push({
          title: 'Management',
          icon: 'mdi-account-group',
          children: [
            {
              title: 'Users',
              icon: 'mdi-account-multiple',
              to: '/users'
            },
            {
              title: 'Roles',
              icon: 'mdi-shield-account',
              to: '/roles'
            }
          ]
        })
      }
      
      baseItems.push(
        {
          title: 'Reports',
          icon: 'mdi-file-chart',
          to: '/reports',
          badge: '5'
        },
        {
          title: 'Settings',
          icon: 'mdi-cog',
          to: '/settings'
        }
      )
      
      return baseItems
    },

    shouldShowDrawer: (state) => {
      return state.isMobile ? state.drawer : true
    },

    isDrawerTemporary: (state) => state.isMobile,

    isDrawerPermanent: (state) => !state.isMobile,

    displayedPageTitle: (state) => {
      return state.pageTitle || 'Page'
    }
  },

  actions: {
    // Drawer management
    toggleDrawer() {
      this.drawer = !this.drawer
    },

    openDrawer() {
      this.drawer = true
    },

    closeDrawer() {
      this.drawer = false
    },

    toggleRailMode() {
      if (!this.isMobile) {
        this.railMode = !this.railMode
      }
    },

    setRailMode(enabled: boolean) {
      if (!this.isMobile) {
        this.railMode = enabled
      }
    },

    // Mobile detection
    setMobile(isMobile: boolean) {
      this.isMobile = isMobile
      
      // Reset drawer and rail mode for mobile
      if (isMobile) {
        this.drawer = false
        this.railMode = false
      }
    },

    // Loading management
    showLoading(text = 'Loading...') {
      this.loadingText = text
      this.globalLoading = true
    },

    hideLoading() {
      this.globalLoading = false
    },

    setLoadingText(text: string) {
      this.loadingText = text
    },

    // Search management
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    clearSearch() {
      this.searchQuery = ''
      this.showSearchResults = false
    },

    toggleSearchResults() {
      this.showSearchResults = !this.showSearchResults
    },

    // Notifications panel
    toggleNotifications() {
      this.showNotifications = !this.showNotifications
    },

    closeNotifications() {
      this.showNotifications = false
    },

    // Breadcrumbs management
    setBreadcrumbs(breadcrumbs: Breadcrumb[]) {
      this.breadcrumbs = breadcrumbs
    },

    addBreadcrumb(breadcrumb: Breadcrumb) {
      this.breadcrumbs.push(breadcrumb)
    },

    clearBreadcrumbs() {
      this.breadcrumbs = []
    },

    // Page meta management
    setPageTitle(title: string) {
      this.pageTitle = title
    },

    // Utility actions
    performSearch() {
      if (this.searchQuery.trim()) {
        navigateTo(`/search?q=${encodeURIComponent(this.searchQuery)}`)
        this.showSearchResults = true
      }
    },

    // Initialize UI state
    initializeUI() {
      if (process.client) {
        // Detect mobile
        const checkMobile = () => {
          this.setMobile(window.innerWidth < 960) // md breakpoint
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        
        // Handle route changes
        const router = useRouter()
        router.afterEach(() => {
          this.hideLoading()
          this.closeNotifications()
          
          if (this.isMobile) {
            this.closeDrawer()
          }
        })
      }
    },

    // Keyboard shortcuts
    handleKeyboardShortcuts(event: KeyboardEvent) {
      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        // Focus search input - would need to emit event or use a ref
        return true
      }
      
      // Escape to close modals/drawers
      if (event.key === 'Escape') {
        if (this.showNotifications) {
          this.closeNotifications()
          return true
        }
        
        if (this.isMobile && this.drawer) {
          this.closeDrawer()
          return true
        }
      }
      
      return false
    }
  }
})
