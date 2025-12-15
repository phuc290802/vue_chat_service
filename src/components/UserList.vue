<template>
  <div class="user-list-dropdown">
    <button @click="toggleDropdown" class="dropdown-btn">
      Users ▾
    </button>
    <div v-if="showDropdown" class="dropdown-content">
      <div v-for="user in users" :key="user.id" class="dropdown-item">
        <span>{{ user.displayName }} (@{{ user.userName }})</span>
        <button @click="addFriend(user.id)" class="add-btn">Add</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userService } from '@/services/userService'

const users = ref([])
const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const fetchUsers = async () => {
  try {
    users.value = await userService.GetAllUser()
  } catch (err) {
    console.error('Failed to fetch users', err)
  }
}

const addFriend = async (userId) => {
  try {
    await userService.AddFriend(userId)
    alert('Friend request sent!')
  } catch (err) {
    console.error('Failed to add friend', err)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list-dropdown {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}

.dropdown-btn {
  padding: 0.5rem 1rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.dropdown-btn:hover {
  background: #1976d2;
}

.dropdown-content {
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 220px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.add-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  background: #388e3c;
}
</style>
