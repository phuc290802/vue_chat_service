import api from './api'

export const conversationService = {
  async getOnlineUsers(conversationId) {
    const response = await api.get(`/conversation/${conversationId}/online-users`)
    return response.data
  },

  async getConverstation(userId) {
    const response = await api.get(`/conversation/${userId}`)
    return response.data
  },

  async getMessagesByConversationId(conversationId){
    const response = await api.get(`/Conversation/message/${conversationId}`)
    return response.data
  },

  async sendMessage(payload){
    const response = await api.post("/conversation/send", payload)
    return response.data
  }
}
