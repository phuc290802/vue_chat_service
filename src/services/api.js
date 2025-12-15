import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: 'https://localhost:7113/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor: attach token
api.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    const token = authStore.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// Response interceptor: auto refresh token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = authStore.refreshToken
        if (!refreshToken) throw new Error('No refresh token available')
        const resp = await axios.post(
          'https://localhost:7113/api/auth/refresh',
          { refreshToken }
        )
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = resp.data
        authStore.setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken })

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        await authStore.clearAuth() // logout user
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
