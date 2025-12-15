import { defineStore } from 'pinia'
import { ref } from 'vue'
import { conversationService } from '@/services/conversationService'

export const useOnlineStore = defineStore('online', () => {
  const onlineUsers = ref([])

  // gọi API và set lại state
  const fetchOnlineUsers = async (conversationId) => {
    const data = await conversationService.getOnlineUsers(conversationId)
    onlineUsers.value = data   // data = array id từ api
  }

  return {
    onlineUsers,
    fetchOnlineUsers
  }
})
