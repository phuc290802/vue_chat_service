<template>
  <div class="user-list-simple">
    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="usersDisplay.length === 0" class="empty">
      No users
    </div>

    <ul class="list">
      <li
        v-for="user in usersDisplay"
        :key="user.id"
        class="item"
        @click="handleSelect(user)"
      >
        <div class="avatar-wrap">
          <!-- Avatar hình ảnh nếu có avatarUrl, ngược lại dùng SVG -->
          <img 
            v-if="user.avatarUrl" 
            :src="user.avatarUrl" 
            :alt="user.name"
            class="avatar-img"
          >
          <svg v-else class="avatar" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
              fill="currentColor"
              opacity="0.9"
            />
          </svg>

          <span 
            class="presence-dot" 
            :class="{ 
              online: user.isOnline, 
              away: user.status === 'away',
              busy: user.status === 'busy'
            }" 
            aria-hidden="true"
            :title="getStatusTitle(user)"
          ></span>
        </div>

        <div class="meta">
          <div class="name">{{ user.name }}</div>
          <div class="sub" v-if="user.sub || user.lastSeen">
            {{ user.sub || formatLastSeen(user.lastSeen) }}
          </div>
        </div>
        
        <!-- Badge cho tin nhắn chưa đọc -->
        <div v-if="user.unreadCount" class="unread-badge">
          {{ user.unreadCount > 99 ? '99+' : user.unreadCount }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { conversationService } from '@/services/conversationService'

// props: either pass conversationId to fetch online users, or pass users prop as array of objects
const props = defineProps({
  conversationId: { type: String, required: false },
  usersProp: { type: Array, required: false }, // optional preloaded users [{ id, name, sub }]
  showMockData: { type: Boolean, default: false } // thêm prop để toggle mock data
})

const emit = defineEmits(['select'])

const usersRaw = ref([])   // raw from API: could be array of ids or array of {id,name}
const loading = ref(false)

// Mock data mẫu cho users
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    displayName: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    isOnline: true,
    status: 'online',
    lastSeen: null,
    sub: 'Product Manager',
    unreadCount: 3,
    lastMessage: 'Hey, how are you doing?',
    lastMessageTime: '10:30 AM'
  },
  {
    id: '2',
    name: 'Jane Smith',
    displayName: 'Jane Smith',
    email: 'jane@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    isOnline: true,
    status: 'online',
    lastSeen: null,
    sub: 'UX Designer',
    unreadCount: 0,
    lastMessage: 'Can you review the designs?',
    lastMessageTime: 'Yesterday'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    displayName: 'Robert Johnson',
    email: 'robert@example.com',
    avatarUrl: null,
    isOnline: false,
    status: 'offline',
    lastSeen: '2024-01-15T14:30:00Z',
    sub: 'Backend Developer',
    unreadCount: 12,
    lastMessage: 'API documentation is ready',
    lastMessageTime: '2 days ago'
  },
  {
    id: '4',
    name: 'Emily Wilson',
    displayName: 'Emily Wilson',
    email: 'emily@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    isOnline: true,
    status: 'away',
    lastSeen: null,
    sub: 'Frontend Developer',
    unreadCount: 0,
    lastMessage: 'Fixed the login bug',
    lastMessageTime: 'Just now'
  },
  {
    id: '5',
    name: 'Michael Brown',
    displayName: 'Michael Brown',
    email: 'michael@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    isOnline: true,
    status: 'busy',
    lastSeen: null,
    sub: 'Team Lead',
    unreadCount: 1,
    lastMessage: 'Meeting at 3 PM',
    lastMessageTime: '30 min ago'
  },
  {
    id: '6',
    name: 'Sarah Davis',
    displayName: 'Sarah Davis',
    email: 'sarah@example.com',
    avatarUrl: null,
    isOnline: false,
    status: 'offline',
    lastSeen: '2024-01-14T09:15:00Z',
    sub: 'QA Engineer',
    unreadCount: 0,
    lastMessage: 'Tests passed successfully',
    lastMessageTime: 'Last week'
  },
  {
    id: '7',
    name: 'David Lee',
    displayName: 'David Lee',
    email: 'david@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    isOnline: true,
    status: 'online',
    lastSeen: null,
    sub: 'DevOps Engineer',
    unreadCount: 5,
    lastMessage: 'Deployment completed',
    lastMessageTime: '1 hour ago'
  },
  {
    id: '8',
    name: 'Lisa Chen',
    displayName: 'Lisa Chen',
    email: 'lisa@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    isOnline: false,
    status: 'offline',
    lastSeen: '2024-01-15T16:45:00Z',
    sub: 'Product Owner',
    unreadCount: 0,
    lastMessage: 'Let\'s sync tomorrow',
    lastMessageTime: 'Today'
  },
  {
    id: '9',
    name: 'Tom Wilson',
    displayName: 'Tom Wilson',
    email: 'tom@example.com',
    avatarUrl: null,
    isOnline: true,
    status: 'online',
    lastSeen: null,
    sub: 'Mobile Developer',
    unreadCount: 0,
    lastMessage: 'App update is live',
    lastMessageTime: '5 min ago'
  },
  {
    id: '10',
    name: 'Alex Turner',
    displayName: 'Alex Turner',
    email: 'alex@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    isOnline: false,
    status: 'offline',
    lastSeen: '2024-01-13T11:20:00Z',
    sub: 'Data Analyst',
    unreadCount: 2,
    lastMessage: 'Report is ready for review',
    lastMessageTime: '3 days ago'
  }
]

const handleSelect = (user) => {
  // Chuẩn hóa user object trước khi emit
  const normalizedUser = {
    id: user.id,
    name: user.name,
    displayName: user.displayName || user.name,
    avatarUrl: user.avatarUrl,
    isOnline: user.isOnline,
    status: user.status,
    lastSeen: user.lastSeen,
    sub: user.sub
  }
  emit('select', normalizedUser)
}

const fetchOnline = async () => {
  if (!props.conversationId) return
  loading.value = true
  try {
    // conversationService.getOnlineUsers returns array of ids (string) in your API
    const resp = await conversationService.getOnlineUsers(props.conversationId)
    // resp could be array of ids OR array of objects — normalize to objects
    usersRaw.value = resp.map(u => {
      if (typeof u === 'string') return { id: u }
      // if u is object with id/name
      return { id: u.id ?? u.userId ?? u, name: u.name ?? u.displayName ?? null }
    })
  } catch (e) {
    console.error('Failed to fetch online users', e)
    usersRaw.value = []
  } finally {
    loading.value = false
  }
}

// Hàm format thời gian last seen
const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return ''
  
  const lastSeenDate = new Date(lastSeen)
  const now = new Date()
  const diffMs = now - lastSeenDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `Last seen ${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return `Last seen on ${lastSeenDate.toLocaleDateString()}`
}

// Hàm lấy title cho trạng thái
const getStatusTitle = (user) => {
  if (user.isOnline) {
    switch (user.status) {
      case 'away': return 'Away'
      case 'busy': return 'Busy'
      default: return 'Online'
    }
  }
  return 'Offline'
}

// Load mock data nếu được yêu cầu
const loadMockData = () => {
  usersRaw.value = [...mockUsers]
  loading.value = false
}

onMounted(async () => {
  if (props.showMockData) {
    // Nếu có prop showMockData, load mock data
    loadMockData()
  } else if (props.usersProp && props.usersProp.length) {
    usersRaw.value = props.usersProp.map(u => ({ 
      id: u.id ?? u, 
      name: u.name ?? u.displayName ?? null,
      avatarUrl: u.avatarUrl,
      isOnline: u.isOnline,
      status: u.status,
      lastSeen: u.lastSeen,
      sub: u.sub,
      unreadCount: u.unreadCount
    }))
  } else if (props.conversationId) {
    await fetchOnline()
  } else {
    // Mặc định hiển thị một vài user mẫu
    usersRaw.value = mockUsers.slice(0, 5)
  }
})

// watch conversationId change
watch(() => props.conversationId, async (nv) => {
  if (nv) await fetchOnline()
})

// usersDisplay: ensure name exists; fallback to "User-xxxx"
const usersDisplay = computed(() =>
  usersRaw.value.map(u => {
    const name = u.name || `User-${String(u.id).slice(0, 6)}`
    const sub = u.sub || formatLastSeen(u.lastSeen) || ''
    
    return { 
      id: u.id, 
      name, 
      sub,
      displayName: u.displayName || name,
      avatarUrl: u.avatarUrl,
      isOnline: u.isOnline ?? false,
      status: u.status || (u.isOnline ? 'online' : 'offline'),
      lastSeen: u.lastSeen,
      unreadCount: u.unreadCount || 0
    }
  })
)

// Thêm hàm để refresh mock data (có thể gọi từ component cha)
const refreshMockData = () => {
  loadMockData()
}

// Expose function for parent component
defineExpose({ refreshMockData })
</script>

<style scoped>
.user-list-simple {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}

.title {
  margin: 0;
  padding: 0.25rem 0.5rem;
  font-weight: 700;
  color: #111827;
  font-size: 0.95rem;
}

.loading,
.empty {
  color: #6b7280;
  font-size: 0.88rem;
  padding: 0.5rem;
}

/* list */
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 48vh;
  overflow-y: auto;
}

/* each item looks like a message preview with border */
.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem;
  border: 1px solid #e6e6e9;
  border-radius: 8px;
  background: #fff;
  transition: background .12s ease, transform .06s ease;
  cursor: pointer;
  position: relative;
}

.item:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(16,24,40,0.04);
}

/* avatar wrapper */
.avatar-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
}

/* avatar image style */
.avatar-img {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: block;
  object-fit: cover;
  background: linear-gradient(180deg, #f3f4f6 0%, #ffffff 100%);
  padding: 3px;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
}

/* svg avatar style */
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: block;
  color: #6b7280; /* svg fill */
  background: linear-gradient(180deg, #f3f4f6 0%, #ffffff 100%);
  padding: 6px;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
}

/* small online dot on avatar */
.presence-dot {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 11px;
  height: 11px;
  border-radius: 999px;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
}

.presence-dot.online {
  background: #10b981; /* green */
  box-shadow: 0 0 0 1px rgba(16,185,129,0.2);
}

.presence-dot.away {
  background: #f59e0b; /* yellow */
  box-shadow: 0 0 0 1px rgba(245,158,11,0.2);
}

.presence-dot.busy {
  background: #ef4444; /* red */
  box-shadow: 0 0 0 1px rgba(239,68,68,0.2);
}

.presence-dot:not(.online):not(.away):not(.busy) {
  background: #9ca3af; /* gray for offline */
  box-shadow: 0 0 0 1px rgba(156,163,175,0.2);
}

/* meta text */
.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub {
  font-size: 0.78rem;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* unread badge */
.unread-badge {
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
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

/* scrollbar small tidy */
.list::-webkit-scrollbar {
  width: 7px;
}
.list::-webkit-scrollbar-track {
  background: rgba(249, 250, 251, 0.5);
  border-radius: 10px;
}
.list::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 10px;
}
.list::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.5);
}

/* Animation for list items */
.item {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animation for list items */
.list li:nth-child(1) { animation-delay: 0.05s; }
.list li:nth-child(2) { animation-delay: 0.1s; }
.list li:nth-child(3) { animation-delay: 0.15s; }
.list li:nth-child(4) { animation-delay: 0.2s; }
.list li:nth-child(5) { animation-delay: 0.25s; }
.list li:nth-child(6) { animation-delay: 0.3s; }
.list li:nth-child(7) { animation-delay: 0.35s; }
.list li:nth-child(8) { animation-delay: 0.4s; }
.list li:nth-child(9) { animation-delay: 0.45s; }
.list li:nth-child(10) { animation-delay: 0.5s; }
</style>