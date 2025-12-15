<template>
  <div class="chat-one-on-one">
    <!-- Chat Header -->
    <div class="chat-header">
      <button class="back-btn" @click="$emit('close')" aria-label="Back to list">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
        </svg>
      </button>
      
      <div class="user-info">
        <div class="avatar-wrapper">
          <img 
            v-if="otherUser?.avatarUrl" 
            :src="otherUser.avatarUrl" 
            :alt="otherUser.displayName"
            class="user-avatar"
          >
          <div v-else class="avatar-placeholder">
            {{ otherUser?.displayName?.charAt(0) || 'U' }}
          </div>
          <div class="online-indicator" :class="{ online: otherUser?.isOnline }"></div>
        </div>
        
        <div class="user-details">
          <h3 class="user-name">{{ otherUser?.displayName || 'Unknown User' }}</h3>
          <p class="user-status">
            <template v-if="otherUser?.isOnline">
              <span v-if="isTypingFromUser" class="typing-text">typing...</span>
              <span v-else>{{ getStatusText(otherUser?.isOnline) }}</span>
            </template>
            <template v-else>
              Last seen {{ formatLastSeen(otherUser?.lastSeen) }}
            </template>
          </p>
        </div>
      </div>
      
      <div class="header-actions">
        <button class="action-btn" title="Video call" @click="startVideoCall">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/>
          </svg>
        </button>
        <button class="action-btn" title="Voice call" @click="startVoiceCall">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57-.1-.04-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1z" fill="currentColor"/>
          </svg>
        </button>
        <button class="action-btn" title="More options" @click="toggleOptions">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="loadingMessages" class="loading-messages">
        <div class="spinner"></div>
        <span>Loading messages...</span>
      </div>
      
      <div v-else-if="messages.length === 0" class="empty-chat">
        <div class="empty-icon">💬</div>
        <p class="empty-title">Start a conversation</p>
        <p class="empty-subtitle">Send your first message to {{ otherUser?.displayName }}</p>
      </div>
      
      <div v-else class="messages-list">
        <!-- Date separator for first message -->
        <div v-if="messages.length > 0" class="date-separator first">
          {{ formatDate(messages[0].createdAt) }}
        </div>
        <div 
          v-for="(message, index) in sortedMessages" 
          :key="message.id"
          class="message-wrapper"
          :class="{ 
            'own-message': message.senderId === currentUser.id,
            'first-in-group': !isConsecutiveMessage(message, index),
            'last-in-group': !isConsecutiveNextMessage(message, index)
          }"
        >
          <!-- Date separator between messages from different days -->
          <div 
            v-if="showDateSeparator(message, index)" 
            class="date-separator"
          >
            {{ formatDate(message.createdAt) }}
          </div>
          
          <div class="message">
            <!-- Avatar for others' messages -->
            <div 
              v-if="message.senderId !== currentUser.id && !isConsecutiveMessage(message, index)" 
              class="message-avatar"
            >
              <img 
                v-if="otherUser?.avatarUrl" 
                :src="otherUser.avatarUrl" 
                :alt="otherUser.displayName"
              >
              <div v-else class="avatar-small">
                {{ otherUser?.displayName?.charAt(0) }}
              </div>
            </div>
            
            <!-- Message content -->
            <div class="message-content">
              <!-- Message body -->
              <div class="message-body">
                <!-- Reply to message (if any) -->
                <div v-if="message.value?.replyTo" class="message-reply">
                  <div class="reply-content">
                    <span class="reply-sender">
                      {{ getReplySender(message.replyTo) }}
                    </span>
                    <span class="reply-text">
                      {{ getReplyText(message.replyTo) }}
                    </span>
                  </div>
                </div>
                
                <template v-if="message.messageType === 'text'">
                  <p class="message-text">{{ message.content }}</p>
                </template>
                
                <template v-else-if="message.messageType === 'image'">
                  <div class="message-image">
                    <img :src="message.content" alt="Image" @click="viewImage(message.content)">
                    <div class="image-overlay" @click="viewImage(message.content)">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="white" stroke-width="2"/>
                        <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="white" stroke-width="2"/>
                      </svg>
                    </div>
                  </div>
                </template>
                
                <template v-else-if="message.messageType === 'file'">
                  <div class="message-file">
                    <div class="file-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="file-info">
                      <span class="file-name">{{ getFileName(message.content) }}</span>
                      <span class="file-size">{{ formatFileSize(message.fileSize) }}</span>
                    </div>
                    <a :href="message.content" download class="download-btn" title="Download">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </a>
                  </div>
                </template>
                
                <template v-else-if="message.messageType === 'system'">
                  <div class="message-system">
                    <span class="system-icon">⚙️</span>
                    <span class="system-text">{{ message.content }}</span>
                  </div>
                </template>
                
                <!-- Attachments -->
                <div v-if="message.value?.attachments?.length" class="attachments">
                  <div 
                    v-for="attachment in message.attachments" 
                    :key="attachment.id"
                    class="attachment-item"
                  >
                    <a :href="attachment.fileUrl" target="_blank" class="attachment-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 4px;">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      {{ attachment.fileName || 'Attachment' }}
                    </a>
                  </div>
                </div>
                
                <!-- Message reactions -->
                <div v-if="message.reactions?.length" class="message-reactions">
                  <div 
                    v-for="reaction in message.reactions" 
                    :key="reaction.id"
                    class="reaction-item"
                    :title="`Reacted with ${reaction.emoji}`"
                  >
                    {{ reaction.emoji }}
                    <span class="reaction-count" v-if="reaction.count > 1">
                      {{ reaction.count }}
                    </span>
                  </div>
                  <button class="add-reaction-btn" @click="addReaction(message.id)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Message meta -->
              <div class="message-meta">
                <span class="message-time">
                  {{ formatTime(message.createdAt) }}
                </span>
                <span v-if="message.senderId === currentUser.id" class="message-status">
                  <span v-if="message.seenAt" class="seen-indicator" title="Seen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="#4CAF50"/>
                    </svg>
                  </span>
                  <span v-else-if="message.deliveredAt" class="delivered-indicator" title="Delivered">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M22 4L12 14.01L9 11.01" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span v-else class="sent-indicator" title="Sent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Typing indicator -->
        <div v-if="isTypingFromUser" class="typing-indicator">
          <div class="typing-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <span>{{ otherUser?.displayName }} is typing...</span>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container">
      <div class="input-actions">
        <button class="input-action-btn" title="Attach file" @click="openFilePicker">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M11.5 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V11.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M21 16V21H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M21 21L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="input-action-btn" title="Take photo" @click="takePhoto">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="input-action-btn" title="Open emoji" @click="openEmoji">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Circle -->
            <circle cx="12" cy="12" r="10"></circle>

            <!-- Eyes -->
            <path d="M8 10h.01"></path>
            <path d="M16 10h.01"></path>

            <!-- Smile -->
            <path d="M8 15c1.3 1.3 2.7 2 4 2s2.7-.7 4-2"></path>
          </svg>
        </button>
      </div>
      
      <div class="message-input-wrapper">
        <textarea
          ref="messageInput"
          v-model="newMessage"
          placeholder="Type a message..."
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact.prevent="newMessage += '\n'"
          @input="handleTyping"
          rows="1"
          class="message-input"
        ></textarea>
        
        <!-- Emoji picker -->
        <div v-if="showEmojiPicker" class="emoji-picker">
          <div class="emoji-picker-header">
            <span>Emoji</span>
            <button @click="toggleEmojiPicker" class="close-emoji">×</button>
          </div>
          <div class="emoji-categories">
            <button 
              v-for="category in emojiCategories" 
              :key="category.name"
              class="emoji-category-btn"
              :class="{ active: activeEmojiCategory === category.name }"
              @click="activeEmojiCategory = category.name"
            >
              {{ category.icon }}
            </button>
          </div>
          <div class="emoji-grid">
            <span 
              v-for="emoji in getEmojisByCategory()" 
              :key="emoji"
              @click="addEmoji(emoji)"
              class="emoji-item"
            >
              {{ emoji }}
            </span>
          </div>
        </div>
      </div>
      
      <button 
        class="send-btn" 
        @click="sendMessage"
        :disabled="!newMessage.trim() || sending"
        :title="newMessage.trim() ? 'Send message' : 'Type a message to send'"
      >
        <svg v-if="sending" viewBox="0 0 24 24" width="20" height="20" class="spinner">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" fill="currentColor"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { conversationService } from '@/services/conversationService'
import { useMessageStore } from '@/stores/message'

// Import mock data
import { 
  formatTime,
  formatDate,
  formatLastSeen,
  formatFileSize,
} from '@/mock'

const props = defineProps({
  selectedUser: {
    type: Object,
    required: true
  },
  conversation: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['close'])

// Refs
const messagesContainer = ref(null)
const messageInput = ref(null)
const newMessage = ref('')
const loadingMessages = ref(false)
const sending = ref(false)
const showEmojiPicker = ref(false)
const isTypingFromUser = ref(false)
const typingTimeout = ref(null)
const activeEmojiCategory = ref('smileys')
const authStore = useAuthStore()
const messageStore = useMessageStore()

// Mock data
const currentUser = ref(authStore.currentUser)
const messages = computed(() => messageStore.messages);

// Emoji data
const emojiCategories = [
  { name: 'smileys', icon: '😀' },
  { name: 'people', icon: '👋' },
  { name: 'nature', icon: '🐶' },
  { name: 'food', icon: '🍎' },
  { name: 'activities', icon: '⚽' },
  { name: 'travel', icon: '🚗' },
  { name: 'objects', icon: '💡' },
  { name: 'symbols', icon: '💯' }
]

const emojis = {
  smileys: ['😀', '😂', '🥰', '😎', '🤔', '😴', '😡', '🥺', '😭', '😱', '😈', '👻'],
  people: ['👋', '👍', '👎', '👏', '🙏', '💪', '👀', '👂', '👃', '👄', '💋', '💘'],
  nature: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
  food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🏹'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛'],
  objects: ['💡', '📱', '💻', '⌚', '📷', '🎥', '💿', '📀', '📺', '📻', '☎️', '📞'],
  symbols: ['💯', '🔢', '❤️', '💔', '💥', '💫', '💦', '💨', '🐾', '👁️', '🗨️', '💬']
}

// Computed
const otherUser = computed(() => {
  return props.selectedUser
})

const conversation = computed(() => {
  return props.conversation
})

// Format helpers
const getStatusText = (isOnline) => {
  return isOnline ? 'Online' : 'Offline'
}

const getFileName = (url) => {
  if (!url) return 'File'
  const parts = url.split('/')
  return decodeURIComponent(parts[parts.length - 1]) || 'File'
}

// Message grouping helpers
const isConsecutiveMessage = (message, index) => {
  if (index === 0) return false
  const prevMessage = messages.value[index - 1]
  if (!prevMessage) return false
  
  const timeDiff = new Date(message.createdAt) - new Date(prevMessage.createdAt)
  const isSameSender = message.senderId === prevMessage.senderId
  const within5Minutes = timeDiff < 5 * 60 * 1000
  
  return isSameSender && within5Minutes
}

const isConsecutiveNextMessage = (message, index) => {
  if (index === messages.value.length - 1) return false
  const nextMessage = messages.value[index + 1]
  if (!nextMessage) return false
  
  const timeDiff = new Date(nextMessage.createdAt) - new Date(message.createdAt)
  const isSameSender = message.senderId === nextMessage.senderId
  const within5Minutes = timeDiff < 5 * 60 * 1000
  
  return isSameSender && within5Minutes
}

const showDateSeparator = (message, index) => {
  if (index === 0) return false
  const prevMessage = messages.value[index - 1]
  if (!prevMessage) return true
  
  const prevDate = new Date(prevMessage.createdAt).toDateString()
  const currentDate = new Date(message.createdAt).toDateString()
  
  return prevDate !== currentDate
}

const sortedMessages = computed(() => {
  if (!messages.value) return []

  return [...messages.value].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  )
})

// Get reply info
const getReplySender = (messageId) => {
  const message = messages.value.find(m => m.id === messageId)
  if (!message) return 'Unknown'
  return message.senderId === currentUser.value.id ? 'You' : otherUser.value?.displayName || 'User'
}

const getReplyText = (messageId) => {
  const message = messages.value.find(m => m.id === messageId)
  if (!message) return 'Message not found'
  
  if (message.messageType === 'image') return '📷 Image'
  if (message.messageType === 'file') return '📎 File'
  return message.content || ''
}

// Get emojis by category
const getEmojisByCategory = () => {
  return emojis[activeEmojiCategory.value] || []
}

// Load messages
const loadMessages = async () => {
  if (!otherUser.value?.id) return
  
  loadingMessages.value = true
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Get conversation messages
    let conversationMessages = []
    if (conversation.value?.id) {
      // Load from conversation
      conversationMessages = await conversationService.getMessagesByConversationId(conversation.value.id)
    } 
    messageStore.setMessages(conversationMessages)
    
    // Auto-scroll to bottom after messages load
    nextTick(() => {
      scrollToBottom('instant')
    })
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    loadingMessages.value = false
  }
}

// Send message
const sendMessage = async () => {
   const trimmedMessage = newMessage.value.trim()
  if (!trimmedMessage || sending.value) return

   sending.value = true

  const message = {
    conversationId: conversation.value.id,
    content: newMessage.value,
    senderId: authStore.currentUser.id,
    messageType : "text"
  };

  await conversationService.sendMessage(message);

  newMessage.value = ''
  sending.value = false
  nextTick(() => {
      scrollToBottom()
      messageInput.value?.focus()
    })

};

// Typing indicator
const handleTyping = () => {
  // In real app: send typing indicator to server
  clearTimeout(typingTimeout.value)
  typingTimeout.value = setTimeout(() => {
    // In real app: clear typing indicator
  }, 2000)
}

// Scroll to bottom
const scrollToBottom = (behavior = 'smooth') => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: behavior
    })
  }
}

// Watch for new messages
watch(() => messages.value.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}, { flush: 'post' })

// Emoji handling
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const addEmoji = (emoji) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
  messageInput.value?.focus()
}

// File handling
const openFilePicker = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    console.log('Files selected:', files)
    // Handle file upload here
  }
  input.click()
}

// Media handling
const takePhoto = () => {
  console.log('Take photo clicked')
  // Implement camera access
}

const openEmoji = () => {
  showEmojiPicker.value = true
}

// Call handling
const startVideoCall = () => {
  console.log('Start video call with:', otherUser.value?.displayName)
}

const startVoiceCall = () => {
  console.log('Start voice call with:', otherUser.value?.displayName)
}

// Reaction handling
const addReaction = (messageId) => {
  console.log('Add reaction to message:', messageId)
}

// Options menu
const toggleOptions = () => {
  console.log('Toggle options menu')
}

// Image viewer
const viewImage = (src) => {
  console.log('View image:', src)
  // Implement image viewer modal
}

// Lifecycle
onMounted(() => {
  loadMessages()
  nextTick(() => {
    messageInput.value?.focus()
    scrollToBottom('instant')
  })
})

onUnmounted(() => {
  clearTimeout(typingTimeout.value)
})

// Watch for selected user changes
watch(() => props.selectedUser, (newUser) => {
  if (newUser) {
    loadMessages()
  }
}, { immediate: true })

// Expose functions if needed
defineExpose({ scrollToBottom })
</script>

<style scoped>
.chat-one-on-one {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
  overflow: hidden;
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background-color: #f1f3f5;
  color: #495057;
  transform: translateX(-2px);
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 0.875rem;
  min-width: 0;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  font-size: 1.125rem;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  transition: all 0.3s;
}

.online-indicator.online {
  background: #40c057;
  box-shadow: 0 0 0 2px rgba(64, 192, 87, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  margin: 0;
  font-size: 0.8125rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.typing-text {
  color: #667eea;
  font-weight: 500;
  font-style: italic;
}

.header-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: #f1f3f5;
  color: #495057;
  transform: translateY(-1px);
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  scroll-behavior: smooth;
  min-height: 0;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}

.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  gap: 1rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
  max-width: 300px;
  line-height: 1.5;
}

/* Messages List */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.date-separator {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.date-separator.first {
  margin-top: 0;
}

.date-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #dee2e6;
  z-index: 1;
}

.date-separator span {
  background: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  color: #6c757d;
  position: relative;
  z-index: 2;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Message Wrapper */
.message-wrapper {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.message-wrapper.own-message .message {
  align-self: flex-end;
}


.message-wrapper:hover {
  transform: translateY(-1px);
}

.message {
  display: flex;
  max-width: 75%;
  gap: 0.75rem;
  position: relative;
}

.own-message {
  width: 100%;
  align-self: flex-end;
}

.own-message .message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  align-self: flex-end;
  margin-bottom: 0.125rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.first-in-group .message-avatar {
  opacity: 1;
}

.message-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-content {
  flex: 1;
  min-width: 0;
}

/* Message Body */
.message-body {
  position: relative;
  border-radius: 18px;
  padding: 0.75rem 1rem;
  transition: all 0.2s;
}

.own-message .message-body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 18px 4px 18px 18px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.first-in-group.own-message .message-body {
  border-bottom-right-radius: 4px;
}

.last-in-group.own-message .message-body {
  border-bottom-right-radius: 18px;
}

.message-wrapper:not(.own-message) .message-body {
  background: white;
  border-radius: 4px 18px 18px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
}

.first-in-group:not(.own-message) .message-body {
  border-top-left-radius: 4px;
}

.last-in-group:not(.own-message) .message-body {
  border-bottom-left-radius: 18px;
}

/* Message reply */
.message-reply {
  background: rgba(0, 0, 0, 0.05);
  border-left: 3px solid #667eea;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
}

.own-message .message-reply {
  background: rgba(255, 255, 255, 0.1);
  border-left: 3px solid white;
}

.reply-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.reply-sender {
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
}

.own-message .reply-sender {
  color: rgba(255, 255, 255, 0.9);
}

.reply-text {
  font-size: 0.8125rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.own-message .reply-text {
  color: rgba(255, 255, 255, 0.8);
}

/* Message text */
.message-text {
  margin: 0;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 0.9375rem;
}

/* Message image */
.message-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  max-width: 300px;
  margin: 0.5rem 0;
}

.message-image img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
  transition: transform 0.3s;
}

.message-image:hover img {
  transform: scale(1.02);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
}

.message-image:hover .image-overlay {
  opacity: 1;
}

/* Message file */
.message-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  margin: 0.5rem 0;
  transition: all 0.2s;
}

.message-file:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.message-wrapper:not(.own-message) .message-file {
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
}

.message-wrapper:not(.own-message) .message-file:hover {
  background: #e9ecef;
}

.file-icon {
  flex-shrink: 0;
}

.file-icon svg {
  color: inherit;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-weight: 500;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}

.file-size {
  font-size: 0.75rem;
  opacity: 0.8;
}

.download-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: inherit;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  flex-shrink: 0;
}

.download-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.message-wrapper:not(.own-message) .download-btn {
  background: #e9ecef;
  color: #495057;
}

.message-wrapper:not(.own-message) .download-btn:hover {
  background: #dee2e6;
}

/* System message */
.message-system {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #6c757d;
}

.system-icon {
  flex-shrink: 0;
}

.system-text {
  flex: 1;
}

/* Attachments */
.attachments {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attachment-item {
  font-size: 0.875rem;
}

.attachment-link {
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: background-color 0.2s;
}

.attachment-link:hover {
  background: rgba(255, 255, 255, 0.2);
  text-decoration: underline;
}

.message-wrapper:not(.own-message) .attachment-link {
  background: #f1f3f5;
  color: #495057;
}

.message-wrapper:not(.own-message) .attachment-link:hover {
  background: #e9ecef;
}

/* Message reactions */
.message-reactions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.reaction-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-item:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.own-message .reaction-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.own-message .reaction-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.reaction-count {
  font-size: 0.6875rem;
  font-weight: 600;
}

.add-reaction-btn {
  background: white;
  border: 1px dashed #dee2e6;
  border-radius: 12px;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-reaction-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.own-message .add-reaction-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.own-message .add-reaction-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Message meta */
.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.message-wrapper:hover .message-meta {
  opacity: 1;
}

.message-time {
  font-size: 0.6875rem;
  color: #adb5bd;
}

.own-message .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-status {
  display: flex;
  align-items: center;
}

.seen-indicator,
.delivered-indicator,
.sent-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
  width: fit-content;
  margin-top: 0.5rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.dot {
  width: 6px;
  height: 6px;
  background: #6c757d;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.typing-indicator span {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Message Input */
.message-input-container {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.input-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.input-action-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-action-btn:hover {
  background-color: #f1f3f5;
  color: #495057;
  transform: translateY(-1px);
}

.message-input-wrapper {
  flex: 1;
  position: relative;
}

.message-input {
  width: 90%;
  border: 1px solid #dee2e6;
  border-radius: 24px;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  resize: none;
  max-height: 120px;
  min-height: 44px;
  font-family: inherit;
  transition: all 0.2s;
  background: #f8f9fa;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Emoji picker */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 0.75rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
  z-index: 1000;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
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

.emoji-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #495057;
  background: #f8f9fa;
}

.close-emoji {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-emoji:hover {
  background-color: #e9ecef;
}

.emoji-categories {
  display: flex;
  padding: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.emoji-category-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 0.5rem;
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.emoji-category-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.emoji-category-btn.active {
  background: #667eea;
  color: white;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  padding: 1rem;
  max-height: 240px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 1.5rem;
  cursor: pointer;
  text-align: center;
  padding: 0.25rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-item:hover {
  background-color: #f1f3f5;
  transform: scale(1.1);
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #adb5bd;
  box-shadow: none;
}

.send-btn .spinner {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-header {
    padding: 0.75rem 1rem;
  }
  
  .message {
    max-width: 85%;
  }
  
  .message-input-container {
    padding: 0.75rem 1rem;
  }
  
  .emoji-picker {
    width: 100%;
    left: 0;
    right: 0;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .input-actions {
    gap: 0.25rem;
  }
  
  .input-action-btn {
    padding: 0.375rem;
  }
}
</style>