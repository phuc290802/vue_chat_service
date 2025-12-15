import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signalRService } from '@/services/signalRService'
import { useAuthStore } from './auth'
import { useRouter } from 'vue-router'
import { friendStore } from './friend'
import { useMessageStore } from './message'

export const useChatStore = defineStore('chat', () => {
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref(null)
  const connections = ref(new Map())
  const messages = ref(new Map())
  const currentConversation = ref(null)
  const authStore = useAuthStore()
  const currentConversationId = ref(null)

  const onlineUsers = computed(() => Array.from(connections.value.keys()))
  const currentMessages = computed(() => {
    if (!currentConversation.value) return []
    return messages.value.get(currentConversation.value.id) || []
  })

  const connect = async () => {
    await authStore.ensureTokenValid();
    const token = authStore.accessToken;

    try {
      isConnecting.value = true;
      error.value = null;
      await signalRService.connect(token);

      isConnected.value = true;
      setupEventListeners();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isConnecting.value = false;
    }
  };


  const disconnect = async () => {
    try {
      await signalRService.disconnect()
    } catch (err) {
      console.error('Error disconnecting:', err)
    } finally {
      isConnected.value = false
      isConnecting.value = false
      error.value = null
    }
  }

  const setupEventListeners = () => {
    const friend = friendStore()
    const offlineTimeouts = new Map()

    signalRService.on('UserOnline', (userId) => {
      friend.setOnline(userId)
    })

    signalRService.on('UserOffline', (userId) => {
      if (offlineTimeouts.has(userId)) {
        clearTimeout(offlineTimeouts.get(userId))
      }

      const timeout = setTimeout(() => {
        friend.setOffline(userId)
        offlineTimeouts.delete(userId)
      }, 5000)

      offlineTimeouts.set(userId, timeout)
    })

    signalRService.on('ReceiveMessage', (msg) => {
      console.log("msg.conversationId", msg.conversationId, currentConversationId.value)
      if(msg.conversationId == currentConversationId.value){
        const messageStore = useMessageStore();
        messageStore.addMessage(msg);
      }
    })

    signalRService.on('UserTyping', (data) => {
      console.log('User typing:', data)
    })
  }

  const joinConversation = async (conversationId) => {
    if (!isConnected.value) return

    try {
      await signalRService.invoke("JoinConversation", conversationId)
      console.log("Joined group:", conversationId)
    } catch (err) {
      console.error("Join failed:", err)
    }
  }


  const addMessage = (conversationId, message) => {
    if (!messages.value.has(conversationId)) {
      messages.value.set(conversationId, [])
    }
    
    const conversationMessages = messages.value.get(conversationId)
    if (!conversationMessages.find(m => m.id === message.id)) {
      conversationMessages.push(message)
      conversationMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }
  }

  const openConversation = async (newId) => {
    if (!isConnected.value) return
    
    // Leave old room
    if (currentConversationId.value) {
      console.log("left room",currentConversationId.value)
      await signalRService.connection.invoke(
        "LeaveConversation",
        currentConversationId.value
      )
    }

    // Update ID
    currentConversationId.value = newId
    console.log("join room",currentConversationId.value)

    // Join new room
    await signalRService.connection.invoke(
      "JoinConversation",
      newId
    )
  }



  return {
    // State
    isConnected,
    currentConversationId,
    isConnecting,
    error,
    connections,
    messages,
    currentConversation,
    
    // Getters
    onlineUsers,
    currentMessages,
    
    // Actions
    connect,
    disconnect,
    joinConversation,
    addMessage,
    openConversation
  }
})