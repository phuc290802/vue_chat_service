<!-- views/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Login to Chat App</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Enter your email"
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Enter your password"
            :disabled="loading"
          />
        </div>
        
        <button 
          type="submit" 
          :disabled="loading" 
          class="login-btn"
          :class="{ 'loading': loading }"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
      
      <p class="auth-link">
        Don't have an account? <router-link to="/register">Register here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { login, loading, error } = useAuth()

const form = ref({
  email: '',
  password: ''
})


const handleLogin = async () => {
  try {
    await login(form.value)
  } catch (err) {
    console.error('❌ Login error:', err)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

/* ✅ FIX BUTTON STYLES */
.login-btn {
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  height: 48px; /* ✅ Fixed height */
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.login-btn:hover:not(:disabled) {
  background: #0056b3;
}

.login-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.login-btn.loading {
  opacity: 0.8;
}

.error-message {
  color: #dc3545;
  background: #f8d7da;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
  margin-top: 1rem;
}

.auth-link {
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
}

.auth-link a {
  color: #007bff;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>