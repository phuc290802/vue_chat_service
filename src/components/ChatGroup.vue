<template>
  <div class="chat-group">
    <div class="chat-group-header">
      <button class="back-btn" @click="$emit('close')">
        ←
      </button>
      <div class="group-info">
        <div class="group-avatar">
          <img v-if="conversation.avatarUrl" :src="conversation.avatarUrl" :alt="conversation.name">
          <div v-else class="avatar-placeholder">
            {{ conversation.name?.charAt(0) }}
          </div>
        </div>
        <div class="group-details">
          <h3 class="group-name">{{ conversation.name }}</h3>
          <p class="group-members">{{ conversation.users.length }} members</p>
        </div>
      </div>
    </div>
    
    <div class="chat-messages">
      <div class="empty-messages">
        <p>Group chat interface will be implemented here</p>
        <p>Conversation with: {{ conversation.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  conversation: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])
</script>

<style scoped>
.chat-group {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.chat-group-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.group-avatar img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.group-details {
  flex: 1;
}

.group-name {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
}

.group-members {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6c757d;
}

.chat-messages {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-messages {
  text-align: center;
  color: #6c757d;
}

.empty-messages p {
  margin: 0.5rem 0;
}
</style>