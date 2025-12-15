import { Message, Attachment, MessageReaction } from '../types/chat.types'
import { mockUsers, currentUser } from './users.mock'

export const mockMessages: Record<string, Message[]> = {

  
  'conv_003': [
    {
      id: 'msg_025',
      conversationId: 'conv_003',
      senderId: 'user_005',
      content: 'Good morning team! Project status update meeting at 10 AM.',
      messageType: 'text',
      createdAt: '2024-01-15T08:00:00Z',
      seenAt: '2024-01-15T08:05:00Z'
    },
    {
      id: 'msg_026',
      conversationId: 'conv_003',
      senderId: "fb1729f4-6077-490c-10e1-08de323444a3",
      content: 'I\'ll be there. I have updates on the chat module.',
      messageType: 'text',
      createdAt: '2024-01-15T08:10:00Z',
      seenAt: '2024-01-15T08:15:00Z'
    },
    {
      id: 'msg_027',
      conversationId: 'conv_003',
      senderId: 'user_001',
      content: 'Me too. Need to discuss the timeline.',
      messageType: 'text',
      createdAt: '2024-01-15T08:20:00Z',
      seenAt: '2024-01-15T08:25:00Z'
    },
    {
      id: 'msg_028',
      conversationId: 'conv_003',
      senderId: 'user_002',
      content: 'Here\'s the meeting agenda',
      messageType: 'text',
      createdAt: '2024-01-15T08:30:00Z',
      seenAt: null,
      attachments: [
        {
          id: 'att_002',
          messageId: 'msg_028',
          fileUrl: 'https://example.com/files/meeting-agenda.pdf',
          fileName: 'project-alpha-meeting-agenda.pdf',
          fileSize: 512000,
          contentType: 'application/pdf'
        }
      ]
    },
    {
      id: 'msg_030',
      conversationId: 'conv_003',
      senderId: 'user_005',
      content: 'Meeting at 3 PM in Conference Room B',
      messageType: 'text',
      createdAt: '2024-01-15T10:15:00Z',
      seenAt: null
    }
  ]
}

// Get messages by conversation ID
export const getMessagesByConversationId = (conversationId: string): Message[] => {
  return mockMessages[conversationId] || []
}

// Add new message
export const addMessage = (conversationId: string, message: Omit<Message, 'id' | 'createdAt'>): Message => {
  const newMessage: Message = {
    ...message,
    id: `msg_${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  
  if (!mockMessages[conversationId]) {
    mockMessages[conversationId] = []
  }
  
  mockMessages[conversationId].push(newMessage)
  return newMessage
}