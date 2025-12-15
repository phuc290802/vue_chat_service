import { User } from '../types/chat.types'

export const mockUsers: User[] = [
  {
    id: 'user_001',
    userName: 'johndoe',
    displayName: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    isOnline: true,
    lastSeen: null,
    status: 'online',
    bio: 'Product Manager at TechCorp',
    phone: '+1 (555) 123-4567'
  },
  {
    id: 'user_002',
    userName: 'janesmith',
    displayName: 'Jane Smith',
    email: 'jane@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    isOnline: true,
    lastSeen: null,
    status: 'online',
    bio: 'UX/UI Designer',
    phone: '+1 (555) 987-6543'
  },
  {
    id: 'user_003',
    userName: 'robertj',
    displayName: 'Robert Johnson',
    email: 'robert@example.com',
    avatarUrl: null,
    isOnline: false,
    lastSeen: '2024-01-15T14:30:00Z',
    status: 'offline',
    bio: 'Backend Developer',
    phone: '+1 (555) 456-7890'
  },
  {
    id: 'user_004',
    userName: 'emilyw',
    displayName: 'Emily Wilson',
    email: 'emily@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    isOnline: true,
    lastSeen: null,
    status: 'away',
    bio: 'Frontend Developer',
    phone: '+1 (555) 234-5678'
  },
  {
    id: 'user_005',
    userName: 'michaelb',
    displayName: 'Michael Brown',
    email: 'michael@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    isOnline: true,
    lastSeen: null,
    status: 'busy',
    bio: 'Team Lead',
    phone: '+1 (555) 345-6789'
  },
  {
    id: 'user_006',
    userName: 'sarahd',
    displayName: 'Sarah Davis',
    email: 'sarah@example.com',
    avatarUrl: null,
    isOnline: false,
    lastSeen: '2024-01-14T09:15:00Z',
    status: 'offline',
    bio: 'QA Engineer',
    phone: '+1 (555) 567-8901'
  },
  {
    id: 'user_007',
    userName: 'davidl',
    displayName: 'David Lee',
    email: 'david@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    isOnline: true,
    lastSeen: null,
    status: 'online',
    bio: 'DevOps Engineer',
    phone: '+1 (555) 678-9012'
  },
  {
    id: 'user_008',
    userName: 'lisac',
    displayName: 'Lisa Chen',
    email: 'lisa@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    isOnline: false,
    lastSeen: '2024-01-15T16:45:00Z',
    status: 'offline',
    bio: 'Product Owner',
    phone: '+1 (555) 789-0123'
  },
  {
    id: 'user_009',
    userName: 'tomw',
    displayName: 'Tom Wilson',
    email: 'tom@example.com',
    avatarUrl: null,
    isOnline: true,
    lastSeen: null,
    status: 'online',
    bio: 'Mobile Developer',
    phone: '+1 (555) 890-1234'
  },
  {
    id: 'user_010',
    userName: 'alexandert',
    displayName: 'Alexander Turner',
    email: 'alex@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    isOnline: false,
    lastSeen: '2024-01-13T11:20:00Z',
    status: 'offline',
    bio: 'Data Analyst',
    phone: '+1 (555) 901-2345'
  }
]

// Current user (logged in user)
export const currentUser: User = {
  id: 'current_user_001',
  userName: 'hoangnguyen',
  displayName: 'Hoang Nguyen',
  email: 'hoang@example.com',
  avatarUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Cuong',
  isOnline: true,
  lastSeen: null,
  status: 'online',
  bio: 'Full-stack Developer',
  phone: '+84 123 456 789'
}

// Online users list (array of userIds)
export const onlineUserIds: string[] = [
  'user_001',
  'user_002',
  'user_004',
  'user_005',
  'user_007',
  'user_009',
  'current_user_001'
]