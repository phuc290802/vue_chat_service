import { Conversation, ConversationMember } from '../types/chat.types'
import { mockUsers, currentUser } from './users.mock'

// Helper function to get user by id
const getUser = (id: string) => {
  if (id === currentUser.id) return currentUser
  return mockUsers.find(u => u.id === id) || mockUsers[0]
}

// Create conversation members
const createMembers = (userIds: string[], ownerId: string): ConversationMember[] => {
  return userIds.map(userId => ({
    conversationId: '', // Will be filled when creating conversation
    userId,
    joinedAt: new Date().toISOString(),
    role: userId === ownerId ? 'owner' : 'member',
    user: getUser(userId)
  }))
}

export const mockConversations: Conversation[] = [
  // 1-1 Conversation with Jane Smith
  {
    id: 'conv_001',
    name: null, // 1-1 conversations don't have names
    isGroup: false,
    isDirectMessage: true,
    createdBy: null,
    createdAt: '2024-01-10T09:00:00Z',
    lastMessage: {
      id: 'msg_015',
      conversationId: 'conv_001',
      senderId: 'user_002',
      content: 'Can you review the designs?',
      messageType: 'text',
      createdAt: '2024-01-15T14:25:00Z',
      seenAt: null
    },
    unreadCount: 2,
    members: createMembers([currentUser.id, 'user_002'], currentUser.id),
    avatarUrl: null // Uses the other user's avatar
  },
  
  // 1-1 Conversation with Robert Johnson
  {
    id: 'conv_002',
    name: null,
    isGroup: false,
    isDirectMessage: true,
    createdBy: null,
    createdAt: '2024-01-12T11:30:00Z',
    lastMessage: {
      id: 'msg_020',
      conversationId: 'conv_002',
      senderId: 'user_003',
      content: 'API documentation is ready for review',
      messageType: 'text',
      createdAt: '2024-01-14T16:45:00Z',
      seenAt: '2024-01-14T17:00:00Z'
    },
    unreadCount: 0,
    members: createMembers([currentUser.id, 'user_003'], currentUser.id)
  },
  
  // Group Conversation - Project Team
  {
    id: 'conv_003',
    name: 'Project Alpha Team',
    isGroup: true,
    isDirectMessage: false,
    createdBy: null,
    createdAt: '2024-01-05T08:00:00Z',
    lastMessage: {
      id: 'msg_030',
      conversationId: 'conv_003',
      senderId: 'user_005',
      content: 'Meeting at 3 PM in Conference Room B',
      messageType: 'text',
      createdAt: '2024-01-15T10:15:00Z',
      seenAt: null
    },
    unreadCount: 5,
    members: createMembers(
      [currentUser.id, 'user_001', 'user_002', 'user_004', 'user_005'],
      currentUser.id
    ),
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Project+Alpha'
  },
  
  // Group Conversation - Design Team
  {
    id: 'conv_004',
    name: 'Design Team',
    isGroup: true,
    isDirectMessage: false,
    createdBy: null,
    createdAt: '2024-01-08T14:00:00Z',
    lastMessage: {
      id: 'msg_040',
      conversationId: 'conv_004',
      senderId: 'user_004',
      content: 'Fixed the login bug, ready for testing',
      messageType: 'text',
      createdAt: '2024-01-15T09:30:00Z',
      seenAt: '2024-01-15T09:45:00Z'
    },
    unreadCount: 0,
    members: createMembers(
      [currentUser.id, 'user_002', 'user_004', 'user_006'],
      'user_002'
    ),
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Design+Team'
  },
  
  // 1-1 Conversation with David Lee
  {
    id: 'conv_005',
    name: null,
    isGroup: false,
    isDirectMessage: true,
    createdBy: null,
    createdAt: '2024-01-13T16:20:00Z',
    lastMessage: {
      id: 'msg_045',
      conversationId: 'conv_005',
      senderId: currentUser.id,
      content: 'Deployment completed successfully! 🎉',
      messageType: 'text',
      createdAt: '2024-01-15T11:45:00Z',
      seenAt: null
    },
    unreadCount: 1,
    members: createMembers([currentUser.id, 'user_007'], 'user_007')
  }
]

// Get conversation by id
export const getConversationById = (id: string): Conversation | undefined => {
  return mockConversations.find(conv => conv.id === id)
}

// Get conversations for user
export const getUserConversations = (userId: string): Conversation[] => {
  return mockConversations.filter(conv => 
    conv.members.some(member => member.userId === userId)
  )
}

// Get 1-1 conversation between two users
export const getDirectConversation = (user1Id: string, user2Id: string): Conversation | undefined => {
  return mockConversations.find(conv => 
    conv.isDirectMessage && 
    conv.members.some(m => m.userId === user1Id) &&
    conv.members.some(m => m.userId === user2Id)
  )
}