// Enterprise Application Type Definitions

// Base API Response structure
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

// User and Authentication types
export interface User {
  id: string | number
  email: string
  name: string
  avatar?: string
  role?: UserRole
  status?: UserStatus
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name: string
  confirmPassword: string
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
  MODERATOR = 'moderator'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

// Navigation and UI types
export interface MenuItem {
  title: string
  icon?: string
  to?: string
  href?: string
  children?: MenuItem[]
  roles?: UserRole[]
  badge?: string | number
  exact?: boolean
}

export interface Breadcrumb {
  text: string
  to?: string
  disabled?: boolean
}

// Form and validation types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox'
  required?: boolean
  rules?: ValidationRule[]
  options?: SelectOption[]
  placeholder?: string
}

export interface SelectOption {
  value: any
  text: string
  disabled?: boolean
}

export interface ValidationRule {
  (value: any): boolean | string
}

// Table and data display types
export interface TableHeader {
  text: string
  value: string
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'start' | 'center' | 'end'
}

export interface TableOptions {
  page: number
  itemsPerPage: number
  sortBy: string[]
  sortDesc: boolean[]
  groupBy: string[]
  groupDesc: boolean[]
  multiSort: boolean
  mustSort: boolean
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timeout?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  text: string
  action: () => void
  color?: string
}

// Theme types
export interface ThemeConfig {
  dark: boolean
  colors: Record<string, string>
}

// Loading and async states
export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

// Dashboard and analytics types
export interface DashboardCard {
  title: string
  value: string | number
  icon: string
  color: string
  trend?: {
    value: number
    direction: 'up' | 'down'
    period: string
  }
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
}

// Generic utility types
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
