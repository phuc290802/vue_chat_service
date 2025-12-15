<template>
  <div class="home">
    <div class="chat-layout">
      <!-- Sidebar -->
      <div class="sidebar">
        <!-- User Info -->
        <div class="user-info">
          <div class="avatar-wrapper">
            <img 
              :src="currentUser.avatarUrl" 
              :alt="currentUser.displayName" 
              class="avatar"
              v-if="currentUser.avatarUrl"
            >
            <div v-else class="avatar-placeholder">
              {{ currentUser.displayName?.charAt(0) }}
            </div>
            <div class="online-indicator" :class="{ online: currentUser.isOnline }"></div>
          </div>
          <div class="user-details">
            <span class="display-name">{{ currentUser.displayName }}</span>
            <span class="username">@{{ currentUser.userName }}</span>
            <span class="user-status" :class="currentUser.status">
              {{ currentUser.status }}
            </span>
          </div>
        </div>

        <!-- Tabs để chuyển đổi giữa Users và Conversations -->
        <div class="tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21" stroke="currentColor" stroke-width="2"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2"/>
              <path d="M22 21V19C21.9993 18.1137 21.7044 17.2528 21.1614 16.5523C20.6184 15.8519 19.8581 15.3516 19 15.13" stroke="currentColor" stroke-width="2"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Users</span>
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'conversations' }"
            @click="activeTab = 'conversations'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Chats</span>
            <span v-if="totalUnreadCount" class="unread-badge">
              {{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}
            </span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Search users or conversations..."
            class="search-input"
            style="width: 70%;"
          >
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Users Tab -->
          <div v-if="activeTab === 'users'" class="users-tab">
            <div class="tab-section">
              <h4 class="section-title">
                <span>Online</span>
                <span class="count">{{ filteredOnlineUsers.length }}</span>
              </h4>
              <div class="users-list">
                <div 
                  v-for="user in filteredOnlineUsers" 
                  :key="user.id"
                  class="user-item"
                  :class="{ active: selectedUser?.id === user.id }"
                  @click="selectUser(user)"
                >
                  <div class="user-item-avatar">
                    <img 
                      v-if="user.avatarUrl" 
                      :src="user.avatarUrl" 
                      :alt="user.displayName"
                    >
                    <div v-else class="avatar-placeholder-small">
                      {{ user.displayName?.charAt(0) }}
                    </div>
                    <div class="user-status-dot" :class="user.status"></div>
                  </div>
                  <div class="user-item-info">
                    <span class="user-item-name">{{ user.displayName }}</span>
                    <span class="user-item-username">@{{ user.userName }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="tab-section">
              <h4 class="section-title">
                <span>Offline</span>
                <span class="count">{{ filteredOfflineUsers.length }}</span>
              </h4>
              <div class="users-list">
                <div 
                  v-for="user in filteredOfflineUsers" 
                  :key="user.id"
                  class="user-item offline"
                  :class="{ active: selectedUser?.id === user.id }"
                  @click="selectUser(user)"
                >
                  <div class="user-item-avatar">
                    <img 
                      v-if="user.avatarUrl" 
                      :src="user.avatarUrl" 
                      :alt="user.displayName"
                    >
                    <div v-else class="avatar-placeholder-small">
                      {{ user.displayName?.charAt(0) }}
                    </div>
                  </div>
                  <div class="user-item-info">
                    <span class="user-item-name">{{ user.displayName }}</span>
                    <span class="user-item-last-seen">
                      {{ formatLastSeen(user.lastSeen) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Conversations Tab -->
          <div v-else class="conversations-tab">
            <div class="conversations-list">
              <div 
                v-for="conversation in filteredConversations" 
                :key="conversation.id"
                class="conversation-item"
                :class="{ 
                  active: selectedConversation?.id === conversation.id,
                  unread: conversation.unreadCount > 0
                }"
                @click="selectConversation(conversation)"
              >
                <div class="conversation-avatar">
                  <img 
                    v-if="getConversationAvatar(conversation)" 
                    :src="getConversationAvatar(conversation)" 
                    :alt="getConversationName(conversation)"
                  >
                  <div v-else class="avatar-placeholder-small">
                    {{ getConversationName(conversation)?.charAt(0) }}
                  </div>
                  <div v-if="conversation.isGroup" class="group-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M2.90527 20.2491C3.82736 18.6531 5.15322 17.3278 6.74966 16.4064C8.3461 15.485 10.1569 15 12 15C13.8432 15 15.654 15.4851 17.2505 16.4065C18.8469 17.3279 20.1728 18.6533 21.0949 20.2493" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
                <div class="conversation-info">
                  <div class="conversation-header">
                    <span class="conversation-name">{{ getConversationName(conversation) }}</span>
                    <span class="conversation-time">
                      12:40
                    </span>
                  </div>
                  <div class="conversation-preview">
                    <span class="conversation-last-message">
                      {{ getLastMessagePreview(conversation) }}
                    </span>
                    <span v-if="conversation.unreadCount" class="conversation-unread">
                      {{ conversation.unreadCount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn" :disabled="chatStore.isConnecting">
          {{ chatStore.isConnecting ? 'Disconnecting...' : 'Logout' }}
        </button>

      </div>

      <!-- Main Content -->
      <div v-if="chatStore.isConnected" class="main-content">
        <!-- Welcome/Empty State -->
        <div v-if="!selectedUser && !selectedConversation" class="empty-state">
          <div class="empty-state-content">
            <div class="empty-state-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#667eea" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="empty-state-title">Welcome to ChatApp</h2>
            <p class="empty-state-description">
              Select a user or conversation to start messaging
            </p>
            <div class="empty-state-stats">
              <div class="stat-item">
                <span class="stat-number">{{ onLineUser() }}</span>
                <span class="stat-label">Online Users</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ conversations.list.length }}</span>
                <span class="stat-label">Conversations</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ totalUnreadCount }}</span>
                <span class="stat-label">Unread Messages</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat with User -->
        <ChatComponent 
          v-else-if="selectedUser"
          :selected-user="selectedUser"
          :conversation="selectedConversation"
          @close="clearSelection"
        />

        <!-- Group Conversation -->
        <ChatGroup 
          v-else-if="selectedConversation"
          :conversation="selectedConversation"
          @close="clearSelection"
        />
      </div>
      <div v-else-if="!chatStore.isConnected" class="connection-error">
          <p>Disconnected from chat service</p>
          <button @click="reconnect" class="reconnect-btn">Reconnect</button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ChatComponent from '@/components/ChatComponent.vue'
import ChatGroup from '@/components/ChatGroup.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'
import { userService } from '@/services/userService'
import { friendStore } from '@/stores/friend'
import { useConversationStore } from '@/stores/conversation'
import { conversationService } from '@/services/conversationService'

import { 
  onlineUserIds,
  formatLastSeen,
} from '@/mock'

// State
const activeTab = ref('users')
const searchQuery = ref('')
const selectedUser = ref(null)
const selectedConversation = ref(null)

// Mock data
const conversations = useConversationStore()
const authStore = useAuthStore()
const chatStore = useChatStore()
const router = useRouter()
const currentUser = ref(authStore.currentUser)
const friend = friendStore()

const handleLogout = async () => {
  await authStore.clearAuth()
  router.push('/login')
}

const reconnect = async () => {
  if (authStore.isAuthenticated) {
    await chatStore.connect(authStore.accessToken)
  }
}

const fetchUsers = async () => {
  try {
    const list= await userService.GetAllUser()
    friend.setUsers(list)
  } catch (err) {
    console.error('Failed to fetch users', err)
  }
}

// Computed
const filteredUsers = computed(() => {
  if (!friend.users) return []
  if (!searchQuery.value) return friend.users

  const query = searchQuery.value.toLowerCase()
  return friend.users.filter(user =>
    user.displayName.toLowerCase().includes(query) ||
    user.userName.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})


const filteredOnlineUsers = computed(() => {
  return filteredUsers.value.filter(
    user => user.isOnline && user.id !== currentUser.value.id
  )
})


const filteredOfflineUsers = computed(() =>
  filteredUsers.value.filter(
    user => !user.isOnline && user.id !== currentUser.value.id
  )
)

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.list
  const query = searchQuery.value.toLowerCase()
  return conversations.list.filter(conv =>
    getConversationName(conv).toLowerCase().includes(query) ||
    getLastMessagePreview(conv).toLowerCase().includes(query)
  )
})

const totalUnreadCount = computed(() => {
  return 1
})

// Methods
const selectUser = (user) => {
  selectedUser.value = user
  selectedConversation.value = null
  // Tìm conversation 1-1 tương ứng nếu có
  const conversation = conversations.list.find(conv => {
  return (
    conv.isDirectMessage &&
    conv.users.some(u => u.id === user.id) &&
    conv.users.some(u => u.id === currentUser.value.id)
  );
});

  
  if (conversation) {
    selectedConversation.value = conversation
    chatStore.openConversation(conversation.id)
  }
}

const selectConversation = (conversation) => {
  selectedConversation.value = conversation
  selectedUser.value = null
  
  // Nếu là conversation 1-1, set selectedUser
  if (conversation.isDirectMessage) {
    const otherUser = conversation.users.find(
      member => member.userId !== currentUser.value.id
    )?.user
    if (otherUser) {
      selectedUser.value = otherUser
    }
  }
}

const clearSelection = () => {
  selectedUser.value = null
  selectedConversation.value = null
}

const getConversationAvatar = (conversation) => {
  if (conversation.avatarUrl) return conversation.avatarUrl
  if (conversation.isDirectMessage) {
    const otherUser = conversation.users.find(
      member => member.id !== currentUser.value.id
    )
    return otherUser?.avatarUrl || null
  }
  return null
}

const getConversationName = (conversation) => {
  if (conversation.name) return conversation.name
  if (conversation.isDirectMessage) {
    const otherUser = conversation.users.find(
      member => member.id !== currentUser.value.id
    )
    return otherUser?.displayName || 'Unknown User'
  }
  return 'Group Chat'
}

const getLastMessagePreview = (conversation) => {
  if (!conversation.lastMessage) return 'No messages yet'
  
  const sender = conversation.lastMessage.senderId === currentUser.value.id 
    ? 'You' 
    : conversation.members.find(m => m.userId === conversation.lastMessage.senderId)?.user?.displayName || 'Someone'
  
  let content = conversation.lastMessage.content || ''
  if (conversation.lastMessage.messageType === 'image') {
    content = '📷 Image'
  } else if (conversation.lastMessage.messageType === 'file') {
    content = '📎 File'
  }
  
  return `${sender}: ${content}`
}

const onLineUser = () => {
  return friend.users.filter(u => u.isOnline).length -1;
}

onMounted(() => {
  if (authStore.isAuthenticated && !chatStore.isConnected && !chatStore.isConnecting) {
    console.log('Ensuring WebSocket connection in Home...')
    chatStore.connect(authStore.accessToken).catch(err => {
      console.log('Home connection attempt failed:', err)
    })
  }
  fetchUsers()
  getConversation(currentUser.value.id)
})

const getConversation = async (userId) => {
  try{
    const list = await  conversationService.getConverstation(userId)
    conversations.setConversations(list)
  }
  catch(err){
    console.error('Failed to fetch Conversation', err)
  }
}
</script>

<style scoped>
.home {
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

.chat-layout {
  display: flex;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
  border-radius: 0;
  overflow: hidden;
}

@media (min-width: 1200px) {
  .chat-layout {
    border-radius: 20px;
    margin: 20px auto;
    height: calc(100vh - 40px);
  }
}

/* Sidebar */
.sidebar {
  width: 360px;
  background: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e9ecef;
  flex-shrink: 0;
  overflow: hidden;
}

/* User Info */
.user-info {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #adb5bd;
  border: 2px solid white;
}

.online-indicator.online {
  background: #40c057;
  box-shadow: 0 0 0 2px rgba(64, 192, 87, 0.2);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.display-name {
  font-weight: 600;
  color: #212529;
  display: block;
  margin-bottom: 0.125rem;
  font-size: 1rem;
}

.username {
  font-size: 0.8125rem;
  color: #6c757d;
  display: block;
  margin-bottom: 0.25rem;
}

.user-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  background: #f1f3f5;
  color: #495057;
  display: inline-block;
}

.user-status.online {
  background: #d4edda;
  color: #155724;
}

.user-status.away {
  background: #fff3cd;
  color: #856404;
}

.user-status.busy {
  background: #f8d7da;
  color: #721c24;
}

/* Tabs */
.tabs {
  display: flex;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
  gap: 0.5rem;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  background: none;
  border-radius: 8px;
  color: #6c757d;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.tab-btn svg {
  flex-shrink: 0;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  margin-left: auto;
}

/* Search Bar */
.search-bar {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f8f9fa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E") no-repeat 0.75rem center;
  background-size: 16px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Tab Content */
.tab-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.tab-section {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f3f5;
}

.tab-section:last-child {
  border-bottom: none;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}

.count {
  background: #f1f3f5;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.6875rem;
}

/* Users List */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-item:hover {
  background: #f8f9fa;
}

.user-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.user-item.offline {
  opacity: 0.7;
}

.user-item-avatar {
  position: relative;
  flex-shrink: 0;
}

.user-item-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.user-status-dot.online {
  background: #40c057;
}

.user-status-dot.away {
  background: #f59e0b;
}

.user-status-dot.busy {
  background: #ef4444;
}

.user-item-info {
  flex: 1;
  min-width: 0;
}

.user-item-name {
  font-weight: 500;
  color: #212529;
  display: block;
  margin-bottom: 0.125rem;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-item-username {
  font-size: 0.75rem;
  color: #6c757d;
  display: block;
}

.user-item-last-seen {
  font-size: 0.75rem;
  color: #adb5bd;
  display: block;
}

/* Conversations List */
.conversations-list {
  display: flex;
  flex-direction: column;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  transition: all 0.2s;
}

.conversation-item:hover {
  background: #f8f9fa;
}

.conversation-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.conversation-item.unread {
  background: rgba(102, 126, 234, 0.05);
}

.conversation-avatar {
  position: relative;
  flex-shrink: 0;
}

.conversation-avatar img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.group-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-badge svg {
  width: 8px;
  height: 8px;
  color: #6c757d;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.conversation-name {
  font-weight: 500;
  color: #212529;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-time {
  font-size: 0.75rem;
  color: #6c757d;
  flex-shrink: 0;
}

.conversation-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-last-message {
  font-size: 0.8125rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.conversation-unread {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  min-height: 0;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
}

.empty-state-icon {
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-state-icon svg {
  color: #667eea;
}

.empty-state-title {
  font-size: 2rem;
  color: #212529;
  margin: 0 0 0.75rem 0;
  font-weight: 700;
}

.empty-state-description {
  color: #6c757d;
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.empty-state-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Scrollbar styling */
.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: transparent;
}

.tab-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.5);
}

.logout-btn {
  padding: 0.75rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.logout-btn:hover:not(:disabled) {
  background: #d32f2f;
}

.logout-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.connection-status, .connection-error, .chat-interface {
  text-align: center;
  width: 100%;
}

.connection-error {
  color: #f44336;
}


/* Responsive */
@media (max-width: 768px) {
  .chat-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 50vh;
  }
  
  .tabs {
    padding: 0.5rem 1rem;
  }
  
  .tab-btn span {
    display: none;
  }
  
  .tab-btn {
    padding: 0.5rem;
  }
  
  .search-bar {
    padding: 0.75rem 1rem;
  }
  
  .tab-section {
    padding: 1rem;
  }
  
  .conversation-item {
    padding: 0.75rem 1rem;
  }
  
  .empty-state-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>