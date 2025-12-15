import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login', 
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresGuest: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  console.log('Router guard - to:', to.name, 'isAuthenticated:', authStore.isAuthenticated)
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login')
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('Redirecting to home')
    next('/')
  } else {
    console.log('Allowing navigation to:', to.name)
    next()
  }
})

export default router