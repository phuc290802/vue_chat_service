import { Attachment } from '../types/chat.types'

export const mockAttachments: Attachment[] = [
  {
    id: 'att_001',
    messageId: 'msg_005',
    fileUrl: 'https://example.com/files/design-v1.fig',
    fileName: 'chat-design-v1.fig',
    fileSize: 2457600,
    contentType: 'application/fig',
    thumbnailUrl: 'https://example.com/thumbs/design-preview.jpg'
  },
  {
    id: 'att_002',
    messageId: 'msg_028',
    fileUrl: 'https://example.com/files/meeting-agenda.pdf',
    fileName: 'project-alpha-meeting-agenda.pdf',
    fileSize: 512000,
    contentType: 'application/pdf'
  },
  {
    id: 'att_003',
    messageId: 'msg_035',
    fileUrl: 'https://example.com/files/screenshot.png',
    fileName: 'bug-screenshot.png',
    fileSize: 1024000,
    contentType: 'image/png',
    thumbnailUrl: 'https://example.com/thumbs/screenshot-thumb.jpg'
  },
  {
    id: 'att_004',
    messageId: 'msg_042',
    fileUrl: 'https://example.com/files/document.docx',
    fileName: 'requirements.docx',
    fileSize: 307200,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
]

// File type categories
export const fileCategories = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ],
  archive: ['application/zip', 'application/x-rar-compressed', 'application/x-tar'],
  code: ['text/javascript', 'application/json', 'text/x-python', 'text/html', 'text/css']
}

// Get file category
export const getFileCategory = (contentType: string | null): string => {
  if (!contentType) return 'other'
  
  for (const [category, types] of Object.entries(fileCategories)) {
    if (types.includes(contentType)) {
      return category
    }
  }
  
  return 'other'
}