// Core user type
export interface User {
  id: string
  userName: string
  displayName: string
  email: string
  avatarUrl: string | null
  isOnline: boolean
  lastSeen: string | null
  status: 'online' | 'away' | 'busy' | 'offline'
  bio?: string
  phone?: string
}

// Conversation types
export interface Conversation {
  id: string
  name: string | null
  isGroup: boolean
  isDirectMessage: boolean
  createdBy: string // userId
  createdAt: string
  lastMessage?: Message
  unreadCount: number
  members: ConversationMember[]
  avatarUrl?: string | null
}

export interface ConversationMember {
  conversationId: string
  userId: string
  joinedAt: string
  role: 'owner' | 'admin' | 'member'
  user: User // Populated user data
}

// Message types
export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string | null
  messageType: 'text' | 'image' | 'file' | 'system'
  createdAt: string
  seenAt: string | null
  reactions?: MessageReaction[]
  attachments?: Attachment[]
  replyTo?: string // messageId
  sender?: User // Populated sender data
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: string
}

// Attachment types
export interface Attachment {
  id: string
  messageId: string
  fileUrl: string
  fileName: string | null
  fileSize: number | null
  contentType: string | null
  thumbnailUrl?: string | null
}

// UI State types
export interface ChatState {
  currentUser: User | null
  selectedConversation: Conversation | null
  selectedUser: User | null // For 1-1 chat
  onlineUsers: string[] // Array of userIds
  typingUsers: Record<string, boolean> // userId -> isTyping
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}