import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { authService } from '@/services/authService'


export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const chatStore = useChatStore()

  const loading = ref(false)
  const error = ref(null)

  const login = async (credentials) => {
  loading.value = true
  error.value = null
  
  try {
    const result = await authService.login(credentials)
    authStore.setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    })

    authStore.setCurrentUser(result.user)
    await chatStore.connect(result.accessToken)
    await router.push('/')
    
    return result
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.response?.data?.message || 'Login failed'
    throw err
  } finally {
    loading.value = false
  }
  }

  const register = async (userData) =>{
    loading.value = true
    error.value = null

    try {
      const result = await authService.register(userData)
      authStore.setTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      })

      authStore.setCurrentUser(result.user)
      await chatStore.connect(result.accessToken)
      router.push('/')
      return result
    }
    catch (err) {
      console.error('Register error:', err)
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    }
    finally {
      loading.value = false
    }
  }
  return {
    loading,
    error,
    login,
    register
  }
}