<template>
  <div id="app">
    <div v-if="authStore.isLoading" class="loading">
      Loading user data...
    </div>
    <router-view v-else />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

</script>

<style>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
}
</style>