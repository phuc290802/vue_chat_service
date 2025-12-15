<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { register, loading, error } = useAuth()

const form = ref({
  userName: '',
  displayName: '', 
  email: '',
  password: '',
  confirmPassword: ''
})

const passwordsMatch = computed(() => {
  return form.value.password === form.value.confirmPassword
})

const handleRegister = async () => {
  if (!passwordsMatch.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    const userData = {
      userName: form.value.userName,
      displayName: form.value.displayName,
      email: form.value.email,
      password: form.value.password
    }
    
    await register(userData)
  } catch (err) {
    console.error('Registration failed:', err)
  }
}
</script>

<template>
  <form @submit.prevent="handleRegister" class="register-form">
    <div class="form-group">
      <label for="userName">Username</label>
      <input
        id="userName"
        v-model="form.userName"
        type="text"
        required
        placeholder="Choose a username"
        :disabled="loading"
      />
    </div>
    
    <div class="form-group">
      <label for="displayName">Display Name</label>
      <input
        id="displayName"
        v-model="form.displayName"
        type="text"
        required
        placeholder="Your display name"
        :disabled="loading"
      />
    </div>
    
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
        placeholder="Choose a password"
        :disabled="loading"
      />
    </div>
    
    <div class="form-group">
      <label for="confirmPassword">Confirm Password</label>
      <input
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        required
        placeholder="Confirm your password"
        :disabled="loading"
      />
    </div>
    
    <button 
      type="submit" 
      :disabled="loading || !passwordsMatch" 
      class="register-btn"
      :class="{ 'loading': loading }"
    >
      {{ loading ? 'Creating Account...' : 'Create Account' }}
    </button>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="!passwordsMatch && form.confirmPassword" class="error-message">
      Passwords do not match
    </div>
  </form>
</template>

<style scoped>
.register-form {
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

.register-btn {
  padding: 0.75rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.register-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.register-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.register-btn.loading {
  opacity: 0.8;
}

.error-message {
  color: #dc3545;
  background: #f8d7da;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}
</style>