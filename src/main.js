import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

async function startApp() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  const authStore = useAuthStore()

  await authStore.checkAuth()

  app.use(router)

  app.mount('#app')
}

startApp()
