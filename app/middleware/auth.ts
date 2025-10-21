export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/privacy', '/terms']
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(to.path)
  
  // If not authenticated and trying to access protected route
  if (!authStore.isAuthenticated && !isPublicRoute) {
    return navigateTo('/auth/login')
  }
  
  // If authenticated and trying to access auth pages, redirect to dashboard
  if (authStore.isAuthenticated && to.path.startsWith('/auth')) {
    return navigateTo('/dashboard')
  }
})

