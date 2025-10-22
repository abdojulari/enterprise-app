import type { ApiResponse } from '~/types'
import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Determine which backend to use based on endpoint
  const getBaseURL = (endpoint: string) => {
    // Auth endpoints go to Python backend
    if (endpoint.startsWith('/api/auth') || endpoint.startsWith('/auth')) {
      return config.public.apiBase
    }
    // AI and social media endpoints stay with Nuxt server (no base URL needed)
    return ''
  }

  // Generic API request function
  const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      // Build headers with authentication token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      }

      // Add Authorization header if user is authenticated
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }

      const baseURL = getBaseURL(endpoint)
      const response = await $fetch<ApiResponse<T>>(`${baseURL}${endpoint}`, {
        ...options,
        headers,
      })

      return response
    } catch (error: any) {
      console.error('API Error:', error)
      
      // Handle different error types
      if (error.response) {
        throw createError({
          statusCode: error.response.status,
          statusMessage: error.response.statusText || 'API Error',
          data: error.response._data,
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Network Error',
        data: { message: 'Unable to connect to the server' },
      })
    }
  }

  // GET request
  const get = async <T>(endpoint: string, query?: Record<string, any>): Promise<ApiResponse<T>> => {
    const queryString = query ? `?${new URLSearchParams(query).toString()}` : ''
    return apiRequest<T>(`${endpoint}${queryString}`, { method: 'GET' })
  }

  // POST request
  const post = async <T>(endpoint: string, body?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  // PUT request
  const put = async <T>(endpoint: string, body?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  // PATCH request
  const patch = async <T>(endpoint: string, body?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  // DELETE request
  const remove = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, { method: 'DELETE' })
  }

  return {
    get,
    post,
    put,
    patch,
    delete: remove,
  }
}

