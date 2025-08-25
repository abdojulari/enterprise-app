export interface Breadcrumb {
  title: string
  to?: string
  disabled?: boolean
}

export interface NavigationItem {
  title: string
  to: string
  icon: string
  exact?: boolean
  badge?: string | number
  children?: NavigationItem[]
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}
