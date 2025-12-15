import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {

  const currentUser = ref(JSON.parse(localStorage.getItem('currentUser') || 'null'))
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)
  const error = ref(null)

  const isTokenExpired = (token) => {
    if (!token) return true
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  }

  const isAuthenticated = computed(() => {
    return !!accessToken.value && !isTokenExpired(accessToken.value)
  })

  const setCurrentUser = (userData) => {
    currentUser.value = userData
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }
  
  const setTokens = (tokens) => {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('currentUser')
    
    if (token && userData) {
      accessToken.value = token
      currentUser.value = JSON.parse(userData)

      // Auto-connect websocket
      try {
        const chatStore = useChatStore()
        if (!chatStore.isConnected) {
          setTimeout(() => {
            
          }, 1000000);
          await chatStore.connect(token)
        }
      } catch (err) {
        console.log('Auto-connect failed:', err)
      }
    }
  }
  
  const clearAuth = async () => {
    const chatStore = useChatStore()
    await chatStore.disconnect()

    currentUser.value = null
    accessToken.value = null
    refreshToken.value = null
    
    localStorage.removeItem('currentUser')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
  
  const loadUserData = async () => {
    if (!isAuthenticated.value) return
    
    isLoading.value = true
    try {
      setCurrentUser(currentUser)
    } catch (error) {
      console.error('Failed to load user data:', error)
      clearAuth()
    } finally {
      isLoading.value = false
    }
  }

  const ensureTokenValid = async () => {
    if (!accessToken.value) return;

    if (isTokenExpired(accessToken.value)) {
      try {
        const resp = await authService.refreshToken(refreshToken.value);
        const { accessToken: newAccess, refreshToken: newRefresh } = resp;

        setTokens({ accessToken: newAccess, refreshToken: newRefresh });

        console.log("Token refreshed!");

      } catch (err) {
        console.error("Refresh failed:", err);
        await clearAuth();
        throw err;
      }
    }
  };

  return {
    currentUser,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    setCurrentUser,
    setTokens,
    clearAuth,
    loadUserData,
    checkAuth,
    ensureTokenValid
  }
})
