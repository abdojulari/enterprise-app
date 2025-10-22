import { defineStore } from 'pinia'

interface NavigationItem {
  title: string
  to: string
  icon: string
  exact?: boolean
  badge?: string | number
  children?: NavigationItem[]
}

interface Breadcrumb {
  title: string
  to?: string
  disabled?: boolean
}

interface UIState {
  drawer: boolean
  railMode: boolean
  isMobile: boolean
  searchQuery: string
  showNotifications: boolean
  displayedPageTitle: string | null
  breadcrumbs: Breadcrumb[]
  navigationItems: NavigationItem[]
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    drawer: true,
    railMode: false,
    isMobile: false,
    searchQuery: '',
    showNotifications: false,
    displayedPageTitle: null,
    breadcrumbs: [],
    navigationItems: [
      {
        title: 'Dashboard',
        to: '/dashboard',
        icon: 'mdi-view-dashboard',
        exact: true
      },
      {
        title: 'Analytics',
        to: '/analytics',
        icon: 'mdi-chart-bar'
      },
      {
        title: 'Campaigns',
        to: '/campaigns',
        icon: 'mdi-email-outline'
      },
      {
        title: 'Leads',
        to: '/leads',
        icon: 'mdi-account-multiple'
      },
      {
        title: 'Scraping',
        to: '/scraping',
        icon: 'mdi-web-check'
      },
      {
        title: 'Stats',
        to: '/stats',
        icon: 'mdi-chart-line'
      },
      {
        title: 'Enrichment',
        to: '/enrichment',
        icon: 'mdi-database-search'
      },
      {
        title: 'Reports',
        to: '/reports',
        icon: 'mdi-file-chart'
      },
      {
        title: 'Social Media',
        to: '/social-media',
        icon: 'mdi-share-variant'
      },
      {
        title: 'Settings',
        to: '/settings',
        icon: 'mdi-cog'
      }
    ]
  }),

  actions: {
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
      this.railMode = !this.railMode
    },

    setRailMode(value: boolean) {
      this.railMode = value
    },

    setMobile(value: boolean) {
      this.isMobile = value
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    toggleNotifications() {
      this.showNotifications = !this.showNotifications
    },

    closeNotifications() {
      this.showNotifications = false
    },

    setPageTitle(title: string | null) {
      this.displayedPageTitle = title
    },

    setBreadcrumbs(breadcrumbs: Breadcrumb[]) {
      this.breadcrumbs = breadcrumbs
    },

    performSearch() {
      // TODO: Implement search functionality
      console.log('Searching for:', this.searchQuery)
    },

    initializeUI() {
      // Set initial mobile state
      this.setMobile(window.innerWidth < 960)

      // Add resize listener
      window.addEventListener('resize', () => {
        this.setMobile(window.innerWidth < 960)
      })
    },

    handleKeyboardShortcuts(event: KeyboardEvent) {
      // Command/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        // TODO: Focus search field
      }

      // Command/Ctrl + [ for toggle drawer
      if ((event.metaKey || event.ctrlKey) && event.key === '[') {
        event.preventDefault()
        this.toggleDrawer()
      }
    }
  }
})